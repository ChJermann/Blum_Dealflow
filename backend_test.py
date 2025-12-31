#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Blum Verwaltungs- und Treuhand AG
Tests all API endpoints including authentication, deals, templates, documents, and chatbot
"""

import requests
import json
import sys
from datetime import datetime
import uuid

class BlumAPITester:
    def __init__(self, base_url="https://ag-wizard.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data
        self.test_email = f"test_{datetime.now().strftime('%H%M%S')}@blum.ch"
        self.test_password = "Test123!"
        self.test_name = "Test User"

    def log_result(self, test_name, success, details="", error=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            print(f"❌ {test_name} - {error}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "error": error
        })

    def make_request(self, method, endpoint, data=None, files=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        if files:
            headers.pop('Content-Type', None)  # Let requests set it for multipart
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, data=data, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            success = response.status_code == expected_status
            return success, response
            
        except Exception as e:
            return False, str(e)

    def test_user_registration(self):
        """Test user registration endpoint"""
        data = {
            "email": self.test_email,
            "password": self.test_password,
            "name": self.test_name,
            "role": "admin"
        }
        
        success, response = self.make_request('POST', 'auth/register', data, expected_status=200)
        
        if success and hasattr(response, 'json'):
            try:
                json_data = response.json()
                if 'access_token' in json_data and 'user' in json_data:
                    self.token = json_data['access_token']
                    self.user_id = json_data['user']['id']
                    self.log_result("User Registration", True, f"User created with ID: {self.user_id}")
                    return True
                else:
                    self.log_result("User Registration", False, error="Missing token or user in response")
                    return False
            except Exception as e:
                self.log_result("User Registration", False, error=f"JSON parse error: {str(e)}")
                return False
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_result("User Registration", False, error=f"Request failed: {error_msg}")
            return False

    def test_user_login(self):
        """Test user login endpoint"""
        data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        success, response = self.make_request('POST', 'auth/login', data, expected_status=200)
        
        if success and hasattr(response, 'json'):
            try:
                json_data = response.json()
                if 'access_token' in json_data:
                    self.token = json_data['access_token']
                    self.log_result("User Login", True, "Login successful")
                    return True
                else:
                    self.log_result("User Login", False, error="Missing access_token in response")
                    return False
            except Exception as e:
                self.log_result("User Login", False, error=f"JSON parse error: {str(e)}")
                return False
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_result("User Login", False, error=f"Request failed: {error_msg}")
            return False

    def test_get_current_user(self):
        """Test get current user endpoint (protected route)"""
        success, response = self.make_request('GET', 'auth/me', expected_status=200)
        
        if success and hasattr(response, 'json'):
            try:
                json_data = response.json()
                if 'id' in json_data and 'email' in json_data:
                    self.log_result("Get Current User", True, f"User data retrieved: {json_data['email']}")
                    return True
                else:
                    self.log_result("Get Current User", False, error="Missing user data in response")
                    return False
            except Exception as e:
                self.log_result("Get Current User", False, error=f"JSON parse error: {str(e)}")
                return False
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_result("Get Current User", False, error=f"Request failed: {error_msg}")
            return False

    def test_get_stats(self):
        """Test stats endpoint"""
        success, response = self.make_request('GET', 'stats', expected_status=200)
        
        if success and hasattr(response, 'json'):
            try:
                json_data = response.json()
                expected_keys = ['total_deals', 'active_deals', 'ankauf_deals', 'verkauf_deals', 'status_counts']
                if all(key in json_data for key in expected_keys):
                    self.log_result("Get Stats", True, f"Stats retrieved: {json_data['total_deals']} total deals")
                    return True
                else:
                    self.log_result("Get Stats", False, error="Missing expected keys in stats response")
                    return False
            except Exception as e:
                self.log_result("Get Stats", False, error=f"JSON parse error: {str(e)}")
                return False
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_result("Get Stats", False, error=f"Request failed: {error_msg}")
            return False

    def test_get_templates(self):
        """Test templates endpoint"""
        success, response = self.make_request('GET', 'templates', expected_status=200)
        
        if success and hasattr(response, 'json'):
            try:
                json_data = response.json()
                if isinstance(json_data, list):
                    self.log_result("Get Templates", True, f"Retrieved {len(json_data)} templates")
                    return True, json_data
                else:
                    self.log_result("Get Templates", False, error="Response is not a list")
                    return False, []
            except Exception as e:
                self.log_result("Get Templates", False, error=f"JSON parse error: {str(e)}")
                return False, []
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_result("Get Templates", False, error=f"Request failed: {error_msg}")
            return False, []

    def test_create_deal(self):
        """Test deal creation endpoint"""
        deal_data = {
            "deal_type": "ankauf",
            "company": {
                "name_current": "Test AG",
                "sitz_current": "Zürich",
                "che_nummer": "CHE-123.456.789",
                "hr_nummer": "CH-020.1.234.567-8",
                "aktienkapital": 100000,
                "anzahl_aktien": 100,
                "nennwert": 1000,
                "liberierung": "voll"
            },
            "sellers": [{
                "party_type": "person",
                "name": "Max Muster",
                "address": "Musterstrasse 1",
                "plz": "8000",
                "ort": "Zürich",
                "land": "Schweiz",
                "email": "max@muster.ch",
                "role": "aktionaer",
                "requires_signature": True
            }],
            "buyers": [{
                "party_type": "firma",
                "name": "Blum Verwaltungs- und Treuhand AG",
                "address": "Bahnhofstrasse 1",
                "plz": "8001",
                "ort": "Zürich",
                "land": "Schweiz",
                "role": "aktionaer",
                "requires_signature": True
            }],
            "vr_members": [{
                "name": "Hans Muster",
                "zeichnungsart": "einzeln",
                "unterschreibt": True
            }],
            "kaufpreis": 50000,
            "kaufpreis_regelung": "Barzahlung",
            "besitzantritt": "2025-01-01",
            "unterschriftsort": "Zürich",
            "unterschriftsdatum": "2025-01-15",
            "anzahlung": 0,
            "anzahlung_aktiviert": False,
            "darlehen_uebernahme": False,
            "darlehen_betrag": 0,
            "notizen": "Test Deal für API Testing"
        }
        
        success, response = self.make_request('POST', 'deals', deal_data, expected_status=200)
        
        if success and hasattr(response, 'json'):
            try:
                json_data = response.json()
                if 'id' in json_data and 'deal_number' in json_data:
                    deal_id = json_data['id']
                    deal_number = json_data['deal_number']
                    self.log_result("Create Deal", True, f"Deal created: {deal_number} (ID: {deal_id})")
                    return True, deal_id
                else:
                    self.log_result("Create Deal", False, error="Missing id or deal_number in response")
                    return False, None
            except Exception as e:
                self.log_result("Create Deal", False, error=f"JSON parse error: {str(e)}")
                return False, None
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_result("Create Deal", False, error=f"Request failed: {error_msg}")
            return False, None

    def test_get_deals(self):
        """Test get deals endpoint"""
        success, response = self.make_request('GET', 'deals', expected_status=200)
        
        if success and hasattr(response, 'json'):
            try:
                json_data = response.json()
                if isinstance(json_data, list):
                    self.log_result("Get Deals", True, f"Retrieved {len(json_data)} deals")
                    return True
                else:
                    self.log_result("Get Deals", False, error="Response is not a list")
                    return False
            except Exception as e:
                self.log_result("Get Deals", False, error=f"JSON parse error: {str(e)}")
                return False
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_result("Get Deals", False, error=f"Request failed: {error_msg}")
            return False

    def test_get_deal_by_id(self, deal_id):
        """Test get deal by ID endpoint"""
        success, response = self.make_request('GET', f'deals/{deal_id}', expected_status=200)
        
        if success and hasattr(response, 'json'):
            try:
                json_data = response.json()
                if 'id' in json_data and json_data['id'] == deal_id:
                    self.log_result("Get Deal by ID", True, f"Deal retrieved: {json_data.get('deal_number', 'N/A')}")
                    return True
                else:
                    self.log_result("Get Deal by ID", False, error="Deal ID mismatch or missing")
                    return False
            except Exception as e:
                self.log_result("Get Deal by ID", False, error=f"JSON parse error: {str(e)}")
                return False
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_result("Get Deal by ID", False, error=f"Request failed: {error_msg}")
            return False

    def test_update_deal_status(self, deal_id):
        """Test deal status update endpoint"""
        status_data = {"status": "in_pruefung"}
        
        success, response = self.make_request('PATCH', f'deals/{deal_id}/status', status_data, expected_status=200)
        
        if success and hasattr(response, 'json'):
            try:
                json_data = response.json()
                if json_data.get('status') == 'in_pruefung':
                    self.log_result("Update Deal Status", True, "Status updated to 'in_pruefung'")
                    return True
                else:
                    self.log_result("Update Deal Status", False, error="Status not updated correctly")
                    return False
            except Exception as e:
                self.log_result("Update Deal Status", False, error=f"JSON parse error: {str(e)}")
                return False
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_result("Update Deal Status", False, error=f"Request failed: {error_msg}")
            return False

    def test_validate_deal(self, deal_id):
        """Test deal validation endpoint"""
        success, response = self.make_request('GET', f'deals/{deal_id}/validate', expected_status=200)
        
        if success and hasattr(response, 'json'):
            try:
                json_data = response.json()
                if 'valid' in json_data and 'errors' in json_data:
                    self.log_result("Validate Deal", True, f"Validation result: {'Valid' if json_data['valid'] else 'Invalid'}")
                    return True
                else:
                    self.log_result("Validate Deal", False, error="Missing validation fields in response")
                    return False
            except Exception as e:
                self.log_result("Validate Deal", False, error=f"JSON parse error: {str(e)}")
                return False
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_result("Validate Deal", False, error=f"Request failed: {error_msg}")
            return False

    def test_generate_document(self, deal_id, template_id):
        """Test document generation endpoint"""
        success, response = self.make_request('POST', f'deals/{deal_id}/documents/generate/{template_id}', expected_status=200)
        
        if success and hasattr(response, 'json'):
            try:
                json_data = response.json()
                if 'id' in json_data and 'filename' in json_data:
                    self.log_result("Generate Document", True, f"Document generated: {json_data['filename']}")
                    return True, json_data['id']
                else:
                    self.log_result("Generate Document", False, error="Missing document data in response")
                    return False, None
            except Exception as e:
                self.log_result("Generate Document", False, error=f"JSON parse error: {str(e)}")
                return False, None
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_result("Generate Document", False, error=f"Request failed: {error_msg}")
            return False, None

    def test_get_deal_documents(self, deal_id):
        """Test get deal documents endpoint"""
        success, response = self.make_request('GET', f'deals/{deal_id}/documents', expected_status=200)
        
        if success and hasattr(response, 'json'):
            try:
                json_data = response.json()
                if isinstance(json_data, list):
                    self.log_result("Get Deal Documents", True, f"Retrieved {len(json_data)} documents")
                    return True
                else:
                    self.log_result("Get Deal Documents", False, error="Response is not a list")
                    return False
            except Exception as e:
                self.log_result("Get Deal Documents", False, error=f"JSON parse error: {str(e)}")
                return False
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_result("Get Deal Documents", False, error=f"Request failed: {error_msg}")
            return False

    def test_chatbot(self, deal_id=None):
        """Test chatbot endpoint"""
        chat_data = {
            "message": "Welche Dokumente benötige ich für einen Ankauf?",
            "deal_id": deal_id
        }
        
        success, response = self.make_request('POST', 'chat', chat_data, expected_status=200)
        
        if success and hasattr(response, 'json'):
            try:
                json_data = response.json()
                if 'response' in json_data:
                    self.log_result("Chatbot", True, f"Chat response received (length: {len(json_data['response'])})")
                    return True
                else:
                    self.log_result("Chatbot", False, error="Missing response in chat data")
                    return False
            except Exception as e:
                self.log_result("Chatbot", False, error=f"JSON parse error: {str(e)}")
                return False
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_result("Chatbot", False, error=f"Request failed: {error_msg}")
            return False

    def test_unauthorized_access(self):
        """Test that protected routes require authentication"""
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success, response = self.make_request('GET', 'deals', expected_status=401)
        
        # Restore token
        self.token = original_token
        
        if success:
            self.log_result("Unauthorized Access Protection", True, "Protected route correctly requires authentication")
            return True
        else:
            self.log_result("Unauthorized Access Protection", False, error="Protected route accessible without authentication")
            return False

    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting Blum API Test Suite")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Authentication Tests
        print("\n📋 Authentication Tests")
        if not self.test_user_registration():
            print("❌ Registration failed - stopping tests")
            return False
        
        if not self.test_user_login():
            print("❌ Login failed - stopping tests")
            return False
        
        self.test_get_current_user()
        self.test_unauthorized_access()
        
        # Basic API Tests
        print("\n📋 Basic API Tests")
        self.test_get_stats()
        templates_success, templates = self.test_get_templates()
        
        # Deal Management Tests
        print("\n📋 Deal Management Tests")
        self.test_get_deals()
        deal_success, deal_id = self.test_create_deal()
        
        if deal_success and deal_id:
            self.test_get_deal_by_id(deal_id)
            self.test_update_deal_status(deal_id)
            self.test_validate_deal(deal_id)
            self.test_get_deal_documents(deal_id)
            
            # Document Generation Tests
            if templates_success and templates:
                print("\n📋 Document Generation Tests")
                template_id = templates[0]['id']  # Use first template
                doc_success, doc_id = self.test_generate_document(deal_id, template_id)
        
        # Chatbot Tests
        print("\n📋 Chatbot Tests")
        self.test_chatbot(deal_id if deal_success else None)
        
        # Print Summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    """Main test execution"""
    tester = BlumAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results = {
        "timestamp": datetime.now().isoformat(),
        "base_url": tester.base_url,
        "total_tests": tester.tests_run,
        "passed_tests": tester.tests_passed,
        "success_rate": (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
        "test_details": tester.test_results
    }
    
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: /app/backend_test_results.json")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())