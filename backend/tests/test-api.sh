#!/bin/bash
# BuildMyHome API Test Script
# Usage: ./test-api.sh [base_url]
# Default base_url: http://localhost:5000

BASE_URL=${1:-http://localhost:5000}
API_VERSION="v1"

echo "========================================="
echo "  BuildMyHome API Test Suite"
echo "========================================="
echo "Base URL: $BASE_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Store tokens
ACCESS_TOKEN=""
REFRESH_TOKEN=""
USER_ID=""
ENGINEER_ID=""
DESIGN_ID=""
BOOKING_ID=""

# Helper function to print test results
print_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}: $2"
  else
    echo -e "${RED}✗ FAIL${NC}: $2"
  fi
}

# Test 1: Health Check
echo -e "\n${YELLOW}=== Testing Health Check ===${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/health.json "$BASE_URL/health")
echo "Response: $(cat /tmp/health.json)"
print_result $((response != 200)) "Health check"

# Test 2: Register User
echo -e "\n${YELLOW}=== Testing User Registration ===${NC}"
EMAIL="test$(date +%s)@example.com"
response=$(curl -s -w "%{http_code}" -o /tmp/register.json -X POST "$BASE_URL/api/$API_VERSION/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"password123\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

echo "Response: $(cat /tmp/register.json)"
if [ "$response" = "201" ]; then
  ACCESS_TOKEN=$(cat /tmp/register.json | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  REFRESH_TOKEN=$(cat /tmp/register.json | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
  USER_ID=$(cat /tmp/register.json | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  print_result 0 "User registration"
else
  print_result 1 "User registration"
fi

# Test 3: Login
echo -e "\n${YELLOW}=== Testing User Login ===${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/login.json -X POST "$BASE_URL/api/$API_VERSION/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"password123\"
  }")

echo "Response: $(cat /tmp/login.json)"
if [ "$response" = "200" ]; then
  ACCESS_TOKEN=$(cat /tmp/login.json | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  REFRESH_TOKEN=$(cat /tmp/login.json | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
  print_result 0 "User login"
else
  print_result 1 "User login"
fi

# Test 4: Get Profile
echo -e "\n${YELLOW}=== Testing Get Profile ===${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/profile.json -X GET "$BASE_URL/api/$API_VERSION/users/profile/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $(cat /tmp/profile.json)"
print_result $((response != 200)) "Get user profile"

# Test 5: Update Profile
echo -e "\n${YELLOW}=== Testing Update Profile ===${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/update.json -X PUT "$BASE_URL/api/$API_VERSION/users/profile/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "UpdatedName",
    "phone": "+1234567890"
  }')

echo "Response: $(cat /tmp/update.json)"
print_result $((response != 200)) "Update user profile"

# Test 6: List Engineers
echo -e "\n${YELLOW}=== Testing List Engineers ===${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/engineers.json -X GET "$BASE_URL/api/$API_VERSION/engineers?page=1&limit=10")

echo "Response: $(cat /tmp/engineers.json)"
print_result $((response != 200)) "List engineers"

# Test 7: Get Engineers (with filters)
echo -e "\n${YELLOW}=== Testing Engineer Filters ===${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/eng_filter.json -X GET "$BASE_URL/api/$API_VERSION/engineers?minRating=4&specialization=modern")

echo "Response: $(cat /tmp/eng_filter.json)"
print_result $((response != 200)) "Engineer filters"

# Test 8: List Designs
echo -e "\n${YELLOW}=== Testing List Designs ===${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/designs.json -X GET "$BASE_URL/api/$API_VERSION/designs?page=1&limit=10")

echo "Response: $(cat /tmp/designs.json)"
print_result $((response != 200)) "List designs"

# Test 9: Design Filters
echo -e "\n${YELLOW}=== Testing Design Filters ===${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/des_filter.json -X GET "$BASE_URL/api/$API_VERSION/designs?style=modern&minCost=1000000&maxCost=5000000")

echo "Response: $(cat /tmp/des_filter.json)"
print_result $((response != 200)) "Design filters"

# Test 10: List Categories
echo -e "\n${YELLOW}=== Testing List Categories ===${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/categories.json -X GET "$BASE_URL/api/$API_VERSION/categories")

echo "Response: $(cat /tmp/categories.json)"
print_result $((response != 200)) "List categories"

# Test 11: Health check with ping
echo -e "\n${YELLOW}=== Testing Ping ===${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/ping.json "$BASE_URL/api/$API_VERSION/ping")

echo "Response: $(cat /tmp/ping.json)"
print_result $((response != 200)) "API ping"

# Test 12: Invalid Token
echo -e "\n${YELLOW}=== Testing Invalid Token ===${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/invalid.json -X GET "$BASE_URL/api/$API_VERSION/users/profile/me" \
  -H "Authorization: Bearer invalid_token")

echo "Response: $(cat /tmp/invalid.json)"
if [ "$response" = "401" ]; then
  print_result 0 "Invalid token rejection"
else
  print_result 1 "Invalid token rejection"
fi

# Test 13: Missing Token
echo -e "\n${YELLOW}=== Testing Missing Token ===${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/missing.json -X GET "$BASE_URL/api/$API_VERSION/users/profile/me")

echo "Response: $(cat /tmp/missing.json)"
if [ "$response" = "401" ]; then
  print_result 0 "Missing token rejection"
else
  print_result 1 "Missing token rejection"
fi

# Test 14: Invalid Registration Data
echo -e "\n${YELLOW}=== Testing Invalid Registration ===${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/invalid_reg.json -X POST "$BASE_URL/api/$API_VERSION/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"invalid-email\",
    \"password\": \"123\"
  }")

echo "Response: $(cat /tmp/invalid_reg.json)"
if [ "$response" = "422" ]; then
  print_result 0 "Invalid registration data rejection"
else
  print_result 1 "Invalid registration data rejection"
fi

# Test 15: Refresh Token
echo -e "\n${YELLOW}=== Testing Token Refresh ===${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/refresh.json -X POST "$BASE_URL/api/$API_VERSION/auth/refresh-token" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")

echo "Response: $(cat /tmp/refresh.json)"
if [ "$response" = "200" ]; then
  NEW_ACCESS=$(cat /tmp/refresh.json | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  if [ -n "$NEW_ACCESS" ]; then
    ACCESS_TOKEN=$NEW_ACCESS
    print_result 0 "Token refresh"
  else
    print_result 1 "Token refresh"
  fi
else
  print_result 1 "Token refresh"
fi

echo ""
echo "========================================="
echo "  Test Suite Complete"
echo "========================================="
echo ""
echo "Summary:"
echo "- Base URL: $BASE_URL"
echo "- API Version: $API_VERSION"
echo "- Access Token: ${ACCESS_TOKEN:0:20}..."
echo ""

# Cleanup
rm -f /tmp/*.json

