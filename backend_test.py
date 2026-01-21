#!/usr/bin/env python3
"""
MDRRMO Procurement System Backend API Tests
Tests all backend API endpoints for the procurement system
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://app-launcher-160.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_purchase_id = None
        self.results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
    
    def log_result(self, test_name, success, message=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        
        if success:
            self.results["passed"] += 1
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {message}")
    
    def test_health_check(self):
        """Test GET /api/ - Health check endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "MDRRMO" in data["message"]:
                    self.log_result("Health Check", True, f"Response: {data}")
                    return True
                else:
                    self.log_result("Health Check", False, f"Unexpected response format: {data}")
                    return False
            else:
                self.log_result("Health Check", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Health Check", False, f"Exception: {str(e)}")
            return False
    
    def test_create_purchase(self):
        """Test POST /api/purchases - Create new purchase"""
        purchase_data = {
            "title": "Office Supplies Purchase",
            "date": "2025-01-20",
            "department": "MDRRMO",
            "purpose": "Monthly office supplies for disaster response team",
            "status": "Pending",
            "supplier1": {
                "name": "ABC Office Supply",
                "address": "123 Main St, Pioduran, Albay"
            },
            "supplier2": {
                "name": "XYZ Trading",
                "address": "456 Market Rd, Pioduran, Albay"
            },
            "supplier3": {
                "name": "",
                "address": ""
            },
            "items": [
                {
                    "number": 1,
                    "name": "Ballpen",
                    "description": "Blue ink",
                    "unit": "box",
                    "quantity": 5,
                    "unitPrice": 150,
                    "total": 750
                },
                {
                    "number": 2,
                    "name": "Bond Paper",
                    "description": "A4 size",
                    "unit": "ream",
                    "quantity": 10,
                    "unitPrice": 200,
                    "total": 2000
                }
            ],
            "totalAmount": 2750
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/purchases",
                json=purchase_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify required fields
                required_fields = ["id", "prNo", "poNo", "obrNo", "dvNo", "title", "totalAmount"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result("Create Purchase", False, f"Missing fields: {missing_fields}")
                    return False
                
                # Verify auto-generated ID format (YYYY-PREFIX-###)
                year = str(datetime.now().year)
                id_checks = [
                    (data["prNo"], f"{year}-PR-"),
                    (data["poNo"], f"{year}-PO-"),
                    (data["obrNo"], f"{year}-OBR-"),
                    (data["dvNo"], f"{year}-DV-")
                ]
                
                for id_value, expected_prefix in id_checks:
                    if not id_value.startswith(expected_prefix):
                        self.log_result("Create Purchase", False, f"Invalid ID format: {id_value} should start with {expected_prefix}")
                        return False
                
                # Store purchase ID for other tests
                self.test_purchase_id = data["id"]
                
                self.log_result("Create Purchase", True, f"Created purchase with ID: {self.test_purchase_id}")
                return True
            else:
                self.log_result("Create Purchase", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Create Purchase", False, f"Exception: {str(e)}")
            return False
    
    def test_get_all_purchases(self):
        """Test GET /api/purchases - Get all purchases"""
        try:
            response = requests.get(f"{self.base_url}/purchases", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    # Check if our created purchase is in the list
                    if self.test_purchase_id:
                        found = any(p.get("id") == self.test_purchase_id for p in data)
                        if found:
                            self.log_result("Get All Purchases", True, f"Found {len(data)} purchases including our test purchase")
                            return True
                        else:
                            self.log_result("Get All Purchases", False, "Created purchase not found in list")
                            return False
                    else:
                        self.log_result("Get All Purchases", True, f"Retrieved {len(data)} purchases")
                        return True
                else:
                    self.log_result("Get All Purchases", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_result("Get All Purchases", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Get All Purchases", False, f"Exception: {str(e)}")
            return False
    
    def test_get_single_purchase(self):
        """Test GET /api/purchases/{id} - Get single purchase"""
        if not self.test_purchase_id:
            self.log_result("Get Single Purchase", False, "No test purchase ID available")
            return False
        
        try:
            response = requests.get(f"{self.base_url}/purchases/{self.test_purchase_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("id") == self.test_purchase_id:
                    self.log_result("Get Single Purchase", True, f"Retrieved purchase: {data.get('title')}")
                    return True
                else:
                    self.log_result("Get Single Purchase", False, f"ID mismatch: expected {self.test_purchase_id}, got {data.get('id')}")
                    return False
            elif response.status_code == 404:
                self.log_result("Get Single Purchase", False, "Purchase not found (404)")
                return False
            else:
                self.log_result("Get Single Purchase", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Get Single Purchase", False, f"Exception: {str(e)}")
            return False
    
    def test_update_purchase_status(self):
        """Test PATCH /api/purchases/{id}/status - Update purchase status"""
        if not self.test_purchase_id:
            self.log_result("Update Purchase Status", False, "No test purchase ID available")
            return False
        
        try:
            status_data = {"status": "Approved"}
            response = requests.patch(
                f"{self.base_url}/purchases/{self.test_purchase_id}/status",
                json=status_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("status") == "Approved":
                    self.log_result("Update Purchase Status", True, f"Status updated to: {data.get('status')}")
                    return True
                else:
                    self.log_result("Update Purchase Status", False, f"Status not updated: {data.get('status')}")
                    return False
            else:
                self.log_result("Update Purchase Status", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Update Purchase Status", False, f"Exception: {str(e)}")
            return False
    
    def test_update_purchase(self):
        """Test PUT /api/purchases/{id} - Update entire purchase"""
        if not self.test_purchase_id:
            self.log_result("Update Purchase", False, "No test purchase ID available")
            return False
        
        updated_data = {
            "title": "Updated Office Supplies Purchase",
            "date": "2025-01-21",
            "department": "MDRRMO",
            "purpose": "Updated monthly office supplies for disaster response team",
            "status": "Approved",
            "supplier1": {
                "name": "ABC Office Supply Updated",
                "address": "123 Main St, Pioduran, Albay"
            },
            "supplier2": {
                "name": "XYZ Trading",
                "address": "456 Market Rd, Pioduran, Albay"
            },
            "supplier3": {
                "name": "",
                "address": ""
            },
            "items": [
                {
                    "number": 1,
                    "name": "Ballpen",
                    "description": "Blue ink",
                    "unit": "box",
                    "quantity": 5,
                    "unitPrice": 150,
                    "total": 750
                },
                {
                    "number": 2,
                    "name": "Bond Paper",
                    "description": "A4 size",
                    "unit": "ream",
                    "quantity": 15,
                    "unitPrice": 200,
                    "total": 3000
                }
            ],
            "totalAmount": 3750
        }
        
        try:
            response = requests.put(
                f"{self.base_url}/purchases/{self.test_purchase_id}",
                json=updated_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("title") == "Updated Office Supplies Purchase" and data.get("totalAmount") == 3750:
                    self.log_result("Update Purchase", True, f"Purchase updated successfully")
                    return True
                else:
                    self.log_result("Update Purchase", False, f"Update not reflected: title={data.get('title')}, total={data.get('totalAmount')}")
                    return False
            else:
                self.log_result("Update Purchase", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Update Purchase", False, f"Exception: {str(e)}")
            return False
    
    def test_dashboard_stats(self):
        """Test GET /api/purchases/stats/dashboard - Get dashboard statistics"""
        try:
            response = requests.get(f"{self.base_url}/purchases/stats/dashboard", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                required_fields = ["total", "approved", "pending", "denied", "completed", "totalAmount"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result("Dashboard Statistics", False, f"Missing fields: {missing_fields}")
                    return False
                
                # Verify data types
                for field in ["total", "approved", "pending", "denied", "completed"]:
                    if not isinstance(data[field], int):
                        self.log_result("Dashboard Statistics", False, f"Field {field} should be integer, got {type(data[field])}")
                        return False
                
                if not isinstance(data["totalAmount"], (int, float)):
                    self.log_result("Dashboard Statistics", False, f"totalAmount should be number, got {type(data['totalAmount'])}")
                    return False
                
                self.log_result("Dashboard Statistics", True, f"Stats: {data}")
                return True
            else:
                self.log_result("Dashboard Statistics", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Dashboard Statistics", False, f"Exception: {str(e)}")
            return False
    
    def test_delete_purchase(self):
        """Test DELETE /api/purchases/{id} - Delete purchase"""
        if not self.test_purchase_id:
            self.log_result("Delete Purchase", False, "No test purchase ID available")
            return False
        
        try:
            response = requests.delete(f"{self.base_url}/purchases/{self.test_purchase_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if "message" in data and "deleted" in data["message"].lower():
                    # Verify purchase is actually deleted
                    verify_response = requests.get(f"{self.base_url}/purchases/{self.test_purchase_id}", timeout=10)
                    if verify_response.status_code == 404:
                        self.log_result("Delete Purchase", True, f"Purchase deleted successfully")
                        return True
                    else:
                        self.log_result("Delete Purchase", False, "Purchase still exists after deletion")
                        return False
                else:
                    self.log_result("Delete Purchase", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_result("Delete Purchase", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Delete Purchase", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 60)
        print("MDRRMO Procurement System Backend API Tests")
        print("=" * 60)
        print(f"Testing against: {self.base_url}")
        print()
        
        # Test sequence
        tests = [
            ("Health Check", self.test_health_check),
            ("Create Purchase", self.test_create_purchase),
            ("Get All Purchases", self.test_get_all_purchases),
            ("Get Single Purchase", self.test_get_single_purchase),
            ("Update Purchase Status", self.test_update_purchase_status),
            ("Update Purchase", self.test_update_purchase),
            ("Dashboard Statistics", self.test_dashboard_stats),
            ("Delete Purchase", self.test_delete_purchase),
        ]
        
        for test_name, test_func in tests:
            print(f"\n--- Running: {test_name} ---")
            test_func()
        
        # Summary
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📊 Total: {self.results['passed'] + self.results['failed']}")
        
        if self.results["errors"]:
            print("\n🚨 FAILED TESTS:")
            for error in self.results["errors"]:
                print(f"   • {error}")
        
        return self.results["failed"] == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)