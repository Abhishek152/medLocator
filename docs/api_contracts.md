# 📡 API Contracts — Clinic AI Platform

**Base URL:** `http://localhost:8080/api/v1`  
**Content-Type:** `application/json`

---

## Clinics

### `GET /clinics`

Returns a paginated list of all clinics.

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | int | 0 | Page number (0-indexed) |
| `size` | int | 10 | Items per page |

**Response 200:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Apollo Clinic",
      "location": "MG Road, Bangalore",
      "specialization": "General Medicine",
      "rating": 4.5,
      "phone": "+91-9876543210",
      "email": "apollo@clinic.com"
    }
  ],
  "totalElements": 42,
  "totalPages": 5,
  "number": 0,
  "size": 10
}
```

---

### `GET /clinics/{id}`

Returns a single clinic with its associated doctors.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | Clinic ID |

**Response 200:**
```json
{
  "id": 1,
  "name": "Apollo Clinic",
  "location": "MG Road, Bangalore",
  "specialization": "General Medicine",
  "rating": 4.5,
  "phone": "+91-9876543210",
  "email": "apollo@clinic.com",
  "doctors": [
    {
      "id": 10,
      "name": "Dr. Priya Sharma",
      "specialization": "Cardiologist"
    }
  ]
}
```

**Response 404:**
```json
{
  "code": "CLINIC_NOT_FOUND",
  "message": "Clinic with id 99 not found"
}
```

---

### `GET /clinics/search`

Search clinics by name or specialization.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `q` | String | ✅ | Search term |
| `page` | int | | Page number |
| `size` | int | | Page size |

**Example:** `GET /api/v1/clinics/search?q=cardio`

**Response 200:**
```json
{
  "content": [
    {
      "id": 3,
      "name": "Heart Care Clinic",
      "location": "Koramangala, Bangalore",
      "specialization": "Cardiology",
      "rating": 4.8
    }
  ],
  "totalElements": 3,
  "totalPages": 1
}
```

---

## Appointments

### `POST /appointments`

Book a new appointment.

**Request Body:**
```json
{
  "userId": 5,
  "clinicId": 1,
  "doctorId": 10,
  "appointmentTime": "2026-03-20T10:30:00",
  "notes": "Regular checkup"
}
```

**Validation:**
- `userId`, `clinicId`, `appointmentTime` — required
- `appointmentTime` — must be a future datetime

**Response 201:**
```json
{
  "id": 101,
  "userId": 5,
  "clinicId": 1,
  "doctorId": 10,
  "appointmentTime": "2026-03-20T10:30:00",
  "status": "PENDING",
  "notes": "Regular checkup",
  "createdAt": "2026-03-12T17:30:00"
}
```

**Response 400:**
```json
{
  "code": "VALIDATION_ERROR",
  "message": "appointmentTime must be a future date",
  "fields": {
    "appointmentTime": "must be a future date"
  }
}
```

---

### `GET /appointments/user/{userId}`

Get all appointments for a specific user.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `userId` | Long | User ID |

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `status` | String | | Filter by status (PENDING, CONFIRMED, etc.) |

**Response 200:**
```json
[
  {
    "id": 101,
    "userId": 5,
    "clinicId": 1,
    "clinicName": "Apollo Clinic",
    "doctorId": 10,
    "doctorName": "Dr. Priya Sharma",
    "appointmentTime": "2026-03-20T10:30:00",
    "status": "PENDING",
    "notes": "Regular checkup"
  }
]
```

---

## Common Error Responses

| HTTP Status | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Request body fails validation |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Duplicate / conflicting resource |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

**Standard Error Body:**
```json
{
  "code": "NOT_FOUND",
  "message": "Human-readable description",
  "timestamp": "2026-03-12T17:30:00"
}
```

---

## Data Types Reference

| Type | Format | Example |
|---|---|---|
| ID | Long | `1`, `42` |
| DateTime | ISO-8601 | `2026-03-20T10:30:00` |
| Status | String enum | `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED` |
| Rating | Decimal 0-5 | `4.5` |
