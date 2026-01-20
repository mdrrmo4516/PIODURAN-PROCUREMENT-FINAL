from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="MDRRMO Procurement System API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ==================== Define Models ====================

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
    status: str = "Pending"  # Pending, Approved, Denied, Completed
    supplier1: Supplier
    supplier2: Supplier = Supplier()
    supplier3: Supplier = Supplier()
    items: List[ProcurementItem]
    totalAmount: float
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updatedAt: Optional[str] = None

class PurchaseCreate(BaseModel):
    title: str
    date: str
    department: str
    purpose: str = ""
    status: str = "Pending"
    supplier1: Supplier
    supplier2: Supplier = Supplier()
    supplier3: Supplier = Supplier()
    items: List[ProcurementItem]
    totalAmount: float

class PurchaseUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    department: Optional[str] = None
    purpose: Optional[str] = None
    status: Optional[str] = None
    supplier1: Optional[Supplier] = None
    supplier2: Optional[Supplier] = None
    supplier3: Optional[Supplier] = None
    items: Optional[List[ProcurementItem]] = None
    totalAmount: Optional[float] = None

class StatusUpdate(BaseModel):
    status: str

class DashboardStats(BaseModel):
    total: int
    approved: int
    pending: int
    denied: int
    completed: int
    totalAmount: float


# ==================== Helper Functions ====================

def generate_id(prefix: str, count: int) -> str:
    """Generate ID with year and count"""
    year = datetime.now().year
    return f"{year}-{prefix}-{str(count + 1).padStart(3, '0')}"


# ==================== API Routes ====================

@api_router.get("/")
async def root():
    return {"message": "MDRRMO Procurement System API", "version": "1.0"}

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
        
        # Insert into database
        result = await db.purchases.insert_one(purchase_dict)
        
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