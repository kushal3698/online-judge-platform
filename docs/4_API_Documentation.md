# REST API Documentation Specification
## Online Judge Platform — OpenAPI 3.0 Specification

---

| Document Metadata | Details |
| :--- | :--- |
| **Project Title** | Online Judge Platform |
| **API Version** | v1.0.0 |
| **Base URL** | `https://api.onlinejudge.com/api/v1` |
| **Authentication Scheme** | Bearer Token (JSON Web Token) |
| **Format** | JSON (`application/json`) |
| **Author** | **Kuswanth Tumma** |
| **Date** | July 2026 |

---

## 1. Global Standard Responses & Headers

### Request Headers
- `Content-Type: application/json`
- `Authorization: Bearer <JWT_ACCESS_TOKEN>`

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested problem with ID 64b8f... does not exist.",
    "timestamp": "2026-07-26T20:00:00.000Z"
  }
}
```

---

## 2. Authentication Endpoints

### 2.1 Register New User
- **Endpoint**: `POST /auth/signup`
- **Access**: Public
- **Description**: Registers a new regular user account.

#### Request Body
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "SecurePassword123!"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64b8f9e210a1b2001c8e4321",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "User"
    }
  }
}
```

---

### 2.2 User Login
- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Description**: Authenticates user credentials and returns a JWT access token.

#### Request Body
```json
{
  "email": "jane.doe@example.com",
  "password": "SecurePassword123!"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGI4ZjllMjEwYTFiMjAwMWM4ZTQzMjEiLCJyb2xlIjoiVXNlciIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDg2NDAwfQ...",
    "user": {
      "id": "64b8f9e210a1b2001c8e4321",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "User"
    }
  }
}
```

---

### 2.3 Get Current User Profile
- **Endpoint**: `GET /auth/profile`
- **Access**: Authenticated (`User` / `Admin`)

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "64b8f9e210a1b2001c8e4321",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "role": "User",
    "problemsSolved": 42,
    "totalSubmissions": 98,
    "createdAt": "2026-05-10T12:00:00.000Z"
  }
}
```

---

## 3. Problem Management Endpoints

### 3.1 List All Problems
- **Endpoint**: `GET /problems`
- **Access**: Public
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 20)
  - `difficulty` (`Easy` | `Medium` | `Hard`)
  - `search` (keyword string)

#### Response (200 OK)
```json
{
  "success": true,
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  },
  "data": [
    {
      "id": "64b8f9e210a1b2001c8e9999",
      "title": "Two Sum",
      "slug": "two-sum",
      "difficulty": "Easy",
      "constraints": {
        "timeLimitMs": 1000,
        "memoryLimitMb": 256
      }
    }
  ]
}
```

---

### 3.2 Get Problem Details
- **Endpoint**: `GET /problems/:id`
- **Access**: Public

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "64b8f9e210a1b2001c8e9999",
    "title": "Two Sum",
    "slug": "two-sum",
    "statement": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.",
    "difficulty": "Easy",
    "constraints": {
      "timeLimitMs": 1000,
      "memoryLimitMb": 256
    },
    "sampleInput": "[2, 7, 11, 15]\n9",
    "sampleOutput": "[0, 1]"
  }
}
```

---

### 3.3 Create New Problem (Admin Only)
- **Endpoint**: `POST /problems`
- **Access**: Authenticated (`Admin`)

#### Request Body
```json
{
  "title": "Reverse Linked List",
  "statement": "Given the head of a singly linked list, reverse the list, and return the reversed list.",
  "difficulty": "Easy",
  "constraints": {
    "timeLimitMs": 1000,
    "memoryLimitMb": 256
  },
  "sampleInput": "[1, 2, 3, 4, 5]",
  "sampleOutput": "[5, 4, 3, 2, 1]"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "64b8f9e210a1b2001c8e8888",
    "title": "Reverse Linked List",
    "slug": "reverse-linked-list",
    "createdBy": "64b8f9e210a1b2001c8e4321",
    "createdAt": "2026-07-26T20:30:00.000Z"
  }
}
```

---

## 4. Test Case Management Endpoints (Admin Only)

### 4.1 Create Test Case for Problem
- **Endpoint**: `POST /testcases`
- **Access**: Authenticated (`Admin`)

#### Request Body
```json
{
  "problemId": "64b8f9e210a1b2001c8e9999",
  "input": "4\n2 7 11 15\n9",
  "expectedOutput": "0 1",
  "isHidden": true
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "64b8f9e210a1b2001c8e7777",
    "problemId": "64b8f9e210a1b2001c8e9999",
    "isHidden": true
  }
}
```

---

## 5. Submissions Endpoints

### 5.1 Submit Code Solution
- **Endpoint**: `POST /submissions`
- **Access**: Authenticated (`User` / `Admin`)

#### Request Body
```json
{
  "problemId": "64b8f9e210a1b2001c8e9999",
  "language": "cpp",
  "sourceCode": "#include <iostream>\nusing namespace std;\nint main() {\n    int n; if(!(cin >> n)) return 0;\n    int a[100]; for(int i=0;i<n;i++) cin >> a[i];\n    int target; cin >> target;\n    for(int i=0;i<n;i++){\n        for(int j=i+1;j<n;j++){\n            if(a[i]+a[j]==target){\n                cout << i << \" \" << j << endl;\n                return 0;\n            }\n        }\n    }\n    return 0;\n}"
}
```

#### Response (202 Accepted for Processing)
```json
{
  "success": true,
  "data": {
    "submissionId": "64b8f9e210a1b2001c8e5555",
    "status": "Pending",
    "message": "Submission enqueued successfully for evaluation."
  }
}
```

---

### 5.2 Poll Submission Status & Verdict
- **Endpoint**: `GET /submissions/:id`
- **Access**: Authenticated (`User` / `Admin`)

#### Response (200 OK - Processing Complete)
```json
{
  "success": true,
  "data": {
    "id": "64b8f9e210a1b2001c8e5555",
    "problemId": "64b8f9e210a1b2001c8e9999",
    "language": "cpp",
    "verdict": "Accepted",
    "executionTimeMs": 14,
    "memoryUsedKb": 3480,
    "submittedAt": "2026-07-26T20:40:00.000Z"
  }
}
```

---

### 5.3 Get User Submission History
- **Endpoint**: `GET /submissions/history`
- **Access**: Authenticated (`User` / `Admin`)

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "64b8f9e210a1b2001c8e5555",
      "problemTitle": "Two Sum",
      "language": "cpp",
      "verdict": "Accepted",
      "executionTimeMs": 14,
      "submittedAt": "2026-07-26T20:40:00.000Z"
    }
  ]
}
```

---

## 6. Leaderboard Endpoints

### 6.1 Get Global Leaderboard
- **Endpoint**: `GET /leaderboard`
- **Access**: Public

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "userName": "Alex Mercer",
      "problemsSolved": 128,
      "totalSubmissions": 142,
      "accuracy": 90.14
    },
    {
      "rank": 2,
      "userName": "Jane Doe",
      "problemsSolved": 42,
      "totalSubmissions": 98,
      "accuracy": 42.85
    }
  ]
}
```
