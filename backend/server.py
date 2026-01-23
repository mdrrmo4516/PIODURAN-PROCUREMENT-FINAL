from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import base64
import json


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / 'uploads'
UPLOADS_DIR.mkdir(exist_ok=True)

# Create the main app without a prefix
app = FastAPI(title="MDRRMO Procurement System API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ==================== Define Models ====================

# Audit Trail Entry
class AuditEntry(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    action: str  # created, updated, status_changed, approved, denied, attachment_added, attachment_removed
    user: str = "System"
    details: str = ""
    previousValue: Optional[str] = None
    newValue: Optional[str] = None

# Approval Info
class ApprovalInfo(BaseModel):
    approvedBy: str = ""
    approvedAt: Optional[str] = None
    comments: str = ""
    signature: str = ""

# Attachment Model
class Attachment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    originalName: str
    mimeType: str
    size: int
    uploadedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    uploadedBy: str = "System"

# Supplier Model
class Supplier(BaseModel):
    name: str = ""
    address: str = ""

# Item Model
class ProcurementItem(BaseModel):
    number: int
    name: str
    description: str = ""
    unit: str
    quantity: float
    unitPrice: float
    total: float

# Notification Model
class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # approval_required, status_changed, purchase_created, comment_added
    title: str
    message: str
    purchaseId: Optional[str] = None
    read: bool = False
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class NotificationCreate(BaseModel):
    type: str
    title: str
    message: str
    purchaseId: Optional[str] = None

# Purchase/Procurement Model
class Purchase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    prNo: str
    poNo: str
    obrNo: str
    dvNo: str
    title: str
    date: str
    department: str
    purpose: str = ""
    status: str = "Pending"  # Pending, For Review, Approved, Denied, Completed
    priority: str = "Normal"  # Low, Normal, High, Urgent
    supplier1: Supplier
    supplier2: Supplier = Supplier()
    supplier3: Supplier = Supplier()
    items: List[ProcurementItem]
    totalAmount: float
    # Approval workflow fields
    approvalInfo: ApprovalInfo = ApprovalInfo()
    # Attachments
    attachments: List[Attachment] = []
    # Audit trail
    auditTrail: List[AuditEntry] = []
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updatedAt: Optional[str] = None
    createdBy: str = "System"

class PurchaseCreate(BaseModel):
    title: str
    date: str
    department: str
    purpose: str = ""
    status: str = "Pending"
    priority: str = "Normal"
    supplier1: Supplier
    supplier2: Supplier = Supplier()
    supplier3: Supplier = Supplier()
    items: List[ProcurementItem]
    totalAmount: float
    createdBy: str = "System"
    
    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Title is required')
        return v.strip()
    
    @field_validator('items')
    @classmethod
    def items_not_empty(cls, v):
        if not v or len(v) == 0:
            raise ValueError('At least one item is required')
        return v

class PurchaseUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    department: Optional[str] = None
    purpose: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    supplier1: Optional[Supplier] = None
    supplier2: Optional[Supplier] = None
    supplier3: Optional[Supplier] = None
    items: Optional[List[ProcurementItem]] = None
    totalAmount: Optional[float] = None

class StatusUpdate(BaseModel):
    status: str
    comments: str = ""
    approvedBy: str = ""

class DashboardStats(BaseModel):
    total: int
    approved: int
    pending: int
    denied: int
    completed: int
    forReview: int
    totalAmount: float
    highPriority: int
    recentActivity: int


# ==================== Helper Functions ====================

def generate_id(prefix: str, count: int) -> str:
    """Generate ID with year and count"""
    year = datetime.now().year
    return f"{year}-{prefix}-{str(count + 1).zfill(3)}"

def create_audit_entry(action: str, user: str = "System", details: str = "", prev_value: str = None, new_value: str = None) -> dict:
    """Create an audit trail entry"""
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "action": action,
        "user": user,
        "details": details,
        "previousValue": prev_value,
        "newValue": new_value
    }


# ==================== API Routes ====================

@api_router.get("/")
async def root():
    return {"message": "MDRRMO Procurement System API", "version": "2.0"}

# Create new purchase
@api_router.post("/purchases", response_model=Purchase)
async def create_purchase(purchase_data: PurchaseCreate):
    try:
        # Get current count for ID generation
        count = await db.purchases.count_documents({})
        
        # Generate IDs
        purchase_dict = purchase_data.model_dump()
        purchase_dict["id"] = str(uuid.uuid4())
        purchase_dict["prNo"] = generate_id("PR", count)
        purchase_dict["poNo"] = generate_id("PO", count)
        purchase_dict["obrNo"] = generate_id("OBR", count)
        purchase_dict["dvNo"] = generate_id("DV", count)
        purchase_dict["createdAt"] = datetime.now(timezone.utc).isoformat()
        
        # Initialize new fields
        purchase_dict["approvalInfo"] = {"approvedBy": "", "approvedAt": None, "comments": "", "signature": ""}
        purchase_dict["attachments"] = []
        purchase_dict["auditTrail"] = [
            create_audit_entry("created", purchase_data.createdBy, f"Purchase request '{purchase_data.title}' created")
        ]
        
        # Insert into database
        result = await db.purchases.insert_one(purchase_dict)
        
        # Create notification for new purchase
        await create_notification_internal(
            "purchase_created",
            "New Purchase Request",
            f"Purchase request '{purchase_data.title}' has been created and is pending approval.",
            purchase_dict["id"]
        )
        
        # Return created purchase
        created_purchase = await db.purchases.find_one({"id": purchase_dict["id"]}, {"_id": 0})
        return Purchase(**created_purchase)
    
    except Exception as e:
        logging.error(f"Error creating purchase: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating purchase: {str(e)}")

# Get all purchases
@api_router.get("/purchases", response_model=List[Purchase])
async def get_purchases():
    try:
        purchases = await db.purchases.find({}, {"_id": 0}).to_list(1000)
        return [Purchase(**p) for p in purchases]
    except Exception as e:
        logging.error(f"Error fetching purchases: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching purchases: {str(e)}")

# Get single purchase by ID
@api_router.get("/purchases/{purchase_id}", response_model=Purchase)
async def get_purchase(purchase_id: str):
    try:
        purchase = await db.purchases.find_one({"id": purchase_id}, {"_id": 0})
        if not purchase:
            raise HTTPException(status_code=404, detail="Purchase not found")
        return Purchase(**purchase)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching purchase: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching purchase: {str(e)}")

# Update purchase
@api_router.put("/purchases/{purchase_id}", response_model=Purchase)
async def update_purchase(purchase_id: str, purchase_data: PurchaseCreate):
    try:
        # Check if purchase exists
        existing = await db.purchases.find_one({"id": purchase_id})
        if not existing:
            raise HTTPException(status_code=404, detail="Purchase not found")
        
        # Update purchase
        update_dict = purchase_data.model_dump()
        update_dict["updatedAt"] = datetime.now(timezone.utc).isoformat()
        
        await db.purchases.update_one(
            {"id": purchase_id},
            {"$set": update_dict}
        )
        
        # Return updated purchase
        updated = await db.purchases.find_one({"id": purchase_id}, {"_id": 0})
        return Purchase(**updated)
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating purchase: {e}")
        raise HTTPException(status_code=500, detail=f"Error updating purchase: {str(e)}")

# Update purchase status
@api_router.patch("/purchases/{purchase_id}/status", response_model=Purchase)
async def update_purchase_status(purchase_id: str, status_update: StatusUpdate):
    try:
        # Check if purchase exists
        existing = await db.purchases.find_one({"id": purchase_id})
        if not existing:
            raise HTTPException(status_code=404, detail="Purchase not found")
        
        # Update status
        await db.purchases.update_one(
            {"id": purchase_id},
            {"$set": {
                "status": status_update.status,
                "updatedAt": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Return updated purchase
        updated = await db.purchases.find_one({"id": purchase_id}, {"_id": 0})
        return Purchase(**updated)
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating status: {e}")
        raise HTTPException(status_code=500, detail=f"Error updating status: {str(e)}")

# Delete purchase
@api_router.delete("/purchases/{purchase_id}")
async def delete_purchase(purchase_id: str):
    try:
        result = await db.purchases.delete_one({"id": purchase_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Purchase not found")
        return {"message": "Purchase deleted successfully", "id": purchase_id}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting purchase: {e}")
        raise HTTPException(status_code=500, detail=f"Error deleting purchase: {str(e)}")

# Get dashboard statistics
@api_router.get("/purchases/stats/dashboard", response_model=DashboardStats)
async def get_dashboard_stats():
    try:
        purchases = await db.purchases.find({}, {"_id": 0}).to_list(1000)
        
        stats = {
            "total": len(purchases),
            "approved": len([p for p in purchases if p.get("status") == "Approved"]),
            "pending": len([p for p in purchases if p.get("status") == "Pending"]),
            "denied": len([p for p in purchases if p.get("status") == "Denied"]),
            "completed": len([p for p in purchases if p.get("status") == "Completed"]),
            "totalAmount": sum(p.get("totalAmount", 0) for p in purchases if p.get("status") != "Denied")
        }
        
        return DashboardStats(**stats)
    except Exception as e:
        logging.error(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()