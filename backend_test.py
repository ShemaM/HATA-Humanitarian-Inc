#!/usr/bin/env python3
"""
Backend API testing for HATA Humanitarian static website
Tests the Node.js server API endpoints defined in server.js
"""

import requests
import sys
import json
from datetime import datetime

class HATAAPITester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=10)
            else:
                print(f"❌ Failed - Unsupported method {method}")
                return False, {}

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and 'status' in response_data:
                        print(f"   Response: {response_data.get('status', 'N/A')}")
                except:
                    print(f"   Response length: {len(response.text)} chars")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Raw response: {response.text[:200]}")

            return success, response.json() if success else {}

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Request error: {str(e)}")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_endpoint(self):
        """Test the health check endpoint"""
        return self.run_test(
            "Health Check",
            "GET",
            "/api/health",
            200
        )

    def test_featured_activities_endpoint(self):
        """Test the featured activities endpoint"""
        return self.run_test(
            "Featured Activities",
            "GET", 
            "/api/featured-activities",
            200
        )

    def test_featured_activities_with_type(self):
        """Test the featured activities endpoint with type filter"""
        return self.run_test(
            "Featured Activities (with type filter)",
            "GET",
            "/api/featured-activities?type=event",
            200
        )

    def test_contact_form_valid(self):
        """Test contact form with valid data"""
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "message": "This is a test message from the API test suite."
        }
        return self.run_test(
            "Contact Form (Valid Data)",
            "POST",
            "/api/contact",
            200,
            data=contact_data
        )

    def test_contact_form_invalid_email(self):
        """Test contact form with invalid email"""
        contact_data = {
            "name": "Test User",
            "email": "invalid-email",
            "message": "This is a test message."
        }
        return self.run_test(
            "Contact Form (Invalid Email)",
            "POST",
            "/api/contact",
            400,
            data=contact_data
        )

    def test_contact_form_missing_fields(self):
        """Test contact form with missing required fields"""
        contact_data = {
            "name": "Test User"
            # Missing email and message
        }
        return self.run_test(
            "Contact Form (Missing Fields)",
            "POST",
            "/api/contact",
            400,
            data=contact_data
        )

    def test_donate_endpoint(self):
        """Test donate endpoint (should return 501 not implemented)"""
        return self.run_test(
            "Donate Endpoint",
            "POST",
            "/api/donate/create-checkout-session",
            501
        )

    def test_404_endpoint(self):
        """Test non-existent API endpoint"""
        return self.run_test(
            "Non-existent API Endpoint",
            "GET",
            "/api/nonexistent",
            404
        )

def main():
    print("=" * 60)
    print("HATA Humanitarian API Testing")
    print("=" * 60)
    
    # Setup
    tester = HATAAPITester("http://localhost:3000")
    
    # Run tests
    tests = [
        tester.test_health_endpoint,
        tester.test_featured_activities_endpoint,
        tester.test_featured_activities_with_type,
        tester.test_contact_form_valid,
        tester.test_contact_form_invalid_email,
        tester.test_contact_form_missing_fields,
        tester.test_donate_endpoint,
        tester.test_404_endpoint
    ]
    
    for test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            tester.tests_run += 1

    # Print results
    print(f"\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed - check server logs for details")
        return 1

if __name__ == "__main__":
    sys.exit(main())