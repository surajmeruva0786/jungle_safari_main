# 📚 Jungle Safari - API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication

### Login
**POST** `/login`

Authenticates a user and returns user data.

**Request Body:**
```json
{
  "name": "Rajesh Kumar",
  "password": "zoo123"
}
```

**Response (200 OK):**
```json
{
  "id": "user_id",
  "name": "Rajesh Kumar",
  "role": "zookeeper",
  "permissions": ["view_animals", "update_logs"]
}
```

**Errors:**
- `401 Unauthorized` - Incorrect password
- `404 Not Found` - User not found

---

## Animals

### Get All Animals
**GET** `/animals`

Returns all animals in the database.

**Response (200 OK):**
```json
[
  {
    "id": "A001",
    "number": "001",
    "name": "Simba",
    "species": "Lion",
    "age": "5 years",
    "enclosure": "A-12",
    "image": "https://...",
    "health": "excellent",
    "assignedTo": "Rajesh Kumar"
  }
]
```

### Create Animal
**POST** `/animals`

Creates a new animal.

**Request Body:**
```json
{
  "name": "Leo",
  "species": "Lion",
  "age": "3 years",
  "enclosure": "A-13",
  "image": "https://...",
  "health": "good",
  "assignedTo": "Rajesh Kumar"
}
```

**Response (201 Created):**
```json
{
  "id": "A005",
  "number": "005",
  ...
}
```

### Update Animal
**PUT** `/animals/:animal_id`

Updates an animal's details.

**Request Body:**
```json
{
  "health": "fair",
  "notes": "Showing signs of lethargy"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "updated_data": { ... }
}
```

---

## Users

### Get All Users
**GET** `/users`

Returns all users.

**Response (200 OK):**
```json
[
  {
    "id": "user_id",
    "name": "Priya Sharma",
    "role": "admin",
    "permissions": ["all"]
  }
]
```

### Create User
**POST** `/users`

Creates a new user.

**Request Body:**
```json
{
  "name": "New User",
  "role": "zookeeper",
  "permissions": ["view_animals", "update_logs"],
  "password": "default123"
}
```

**Response (201 Created):**
```json
{
  "id": "new_user_id",
  ...
}
```

### Update User
**PUT** `/users/:user_id`

Updates user information.

**Request Body:**
```json
{
  "name": "Updated Name",
  "role": "vet",
  "permissions": ["view_health", "prescribe"],
  "password": "newpass123"
}
```

### Delete User
**DELETE** `/users/:user_id`

Deletes a user.

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## Observations

### Get All Observations
**GET** `/observations`

Returns all observation logs, ordered by creation date (newest first).

**Response (200 OK):**
```json
[
  {
    "id": "obs_id",
    "animalId": "A001",
    "submittedBy": "Rajesh Kumar",
    "createdAt": "2024-01-15T10:30:00Z",
    "healthStatus": "excellent",
    "moodPercentage": 85,
    "appetitePercentage": 90,
    "movementPercentage": 80,
    "injuriesText": "None observed",
    "generalObservationText": "Animal was very playful",
    "aiSummary": { ... }
  }
]
```

### Process Text Observation
**POST** `/process_text_observation`

Processes a text observation with AI and saves it.

**Request (multipart/form-data):**
```
logData: {
  "observationText": "Simba was very active today...",
  "animalId": "A001",
  "createdAt": "2024-01-15T10:30:00Z",
  "healthStatus": "excellent",
  ...
}
gateImage: [file] (optional)
animalImage: [file] (optional)
animalVideo: [file] (optional)
```

**Response (200 OK):**
```json
{
  "animalId": "A001",
  "aiSummary": {
    "date_or_day": "2024-01-15",
    "daily_animal_health_monitoring": "...",
    ...
  },
  "gateImageUrl": "https://cloudinary.com/...",
  ...
}
```

### Process Audio Observation
**POST** `/process_audio_observation`

Transcribes audio and processes observation.

**Request (multipart/form-data):**
```
audio: [audio file]
date: "2024-01-15"
animalId: "A001"
prefix: "Optional prefix text"
```

**Response (200 OK):**
```json
{
  "date_or_day": "2024-01-15",
  "animal_observed_on_time": true,
  ...
}
```

### Transcribe Audio
**POST** `/transcribe_audio`

Transcribes an audio file to text.

**Request (multipart/form-data):**
```
audio: [audio file]
```

**Response (200 OK):**
```json
{
  "transcript": "The animal was seen at 10 AM..."
}
```

---

## Alerts

### Get All Alerts
**GET** `/alerts`

Returns all alerts, ordered by creation time (newest first).

**Response (200 OK):**
```json
[
  {
    "id": "alert_id",
    "type": "sos",
    "animalName": "Simba",
    "message": "Emergency alert",
    "location": "Enclosure A-12",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "createdBy": "Rajesh Kumar"
  }
]
```

### Create Alert
**POST** `/alerts`

Creates a new alert.

**Request Body:**
```json
{
  "type": "sos",
  "animalName": "Simba",
  "message": "Emergency - animal in distress",
  "location": "Enclosure A-12",
  "createdBy": "Rajesh Kumar"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "id": "new_alert_id"
}
```

### Delete Alert
**DELETE** `/alerts/:alert_id`

Dismisses/deletes an alert.

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## Feeding Records

### Get All Feeding Records
**GET** `/feeding_records`

Returns all feeding records, ordered by date (newest first).

**Response (200 OK):**
```json
[
  {
    "id": "record_id",
    "animalId": "A001",
    "feedType": "Meat",
    "amount": "15 kg",
    "cost": 450,
    "status": "completed",
    "recordedAt": "2024-01-15T08:00:00Z",
    "recordedBy": "Vikram Singh"
  }
]
```

### Create Feeding Record
**POST** `/feeding_records`

Creates a new feeding record.

**Request Body:**
```json
{
  "animalId": "A001",
  "feedType": "Meat",
  "amount": "15 kg",
  "cost": 450,
  "status": "completed",
  "recordedBy": "Vikram Singh"
}
```

**Response (201 Created):**
```json
{
  "id": "new_record_id",
  "recordedAt": "2024-01-15T08:00:00Z",
  ...
}
```

### Update Feeding Record
**PUT** `/feeding_records/:record_id`

Updates a feeding record.

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "updated_data": { ... }
}
```

---

## Inventory

### Get All Inventory Items
**GET** `/inventory`

Returns all inventory items, ordered by name.

**Response (200 OK):**
```json
[
  {
    "id": "item_id",
    "name": "Raw Meat",
    "category": "food",
    "quantity": 150,
    "unit": "kg",
    "minThreshold": 50,
    "cost": 450,
    "lastRestocked": "2 days ago",
    "supplier": "Fresh Farms"
  }
]
```

### Create Inventory Item
**POST** `/inventory`

Creates a new inventory item.

**Request Body:**
```json
{
  "name": "Vegetables Mix",
  "category": "food",
  "quantity": 200,
  "unit": "kg",
  "minThreshold": 75,
  "cost": 120,
  "supplier": "Green Harvest"
}
```

**Response (201 Created):**
```json
{
  "id": "new_item_id",
  "lastRestocked": "2024-01-15T10:30:00Z",
  ...
}
```

### Update Inventory Item
**PUT** `/inventory/:item_id`

Updates an inventory item.

**Request Body:**
```json
{
  "quantity": 250,
  "lastRestocked": "today"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "updated_data": { ... }
}
```

### Delete Inventory Item
**DELETE** `/inventory/:item_id`

Deletes an inventory item.

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## Medications

### Get All Medications
**GET** `/medications`

Returns all medication prescriptions, ordered by start date (newest first).

**Response (200 OK):**
```json
[
  {
    "id": "med_id",
    "animalId": "A003",
    "medicationName": "Pain Relief - Ibuprofen",
    "dosage": "200mg",
    "frequency": "As needed",
    "startDate": "2024-01-14",
    "endDate": "2024-01-21",
    "prescribedBy": "Dr. Anjali Verma",
    "purpose": "Joint pain management",
    "status": "active",
    "administrationLog": [],
    "notes": "Administer after meals"
  }
]
```

### Create Medication
**POST** `/medications`

Creates a new medication prescription.

**Request Body:**
```json
{
  "animalId": "A003",
  "medicationName": "Antibiotics",
  "dosage": "500mg",
  "frequency": "Twice daily",
  "startDate": "2024-01-15",
  "endDate": "2024-01-22",
  "prescribedBy": "Dr. Anjali Verma",
  "purpose": "Infection treatment",
  "notes": "Monitor for side effects"
}
```

**Response (201 Created):**
```json
{
  "id": "new_med_id",
  "createdAt": "2024-01-15T10:30:00Z",
  "status": "active",
  "administrationLog": [],
  ...
}
```

### Update Medication
**PUT** `/medications/:medication_id`

Updates a medication (e.g., status, administration log).

**Request Body:**
```json
{
  "status": "completed",
  "administrationLog": [
    {
      "date": "2024-01-15",
      "time": "08:00",
      "administeredBy": "Rajesh Kumar",
      "notes": "Given with food"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "updated_data": { ... }
}
```

### Delete Medication
**DELETE** `/medications/:medication_id`

Deletes a medication prescription.

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## Media Upload

### Upload Media
**POST** `/upload_media`

Uploads an image or video to Cloudinary.

**Request (multipart/form-data):**
```
file: [image or video file]
```

**Response (200 OK):**
```json
{
  "url": "https://res.cloudinary.com/..."
}
```

**Errors:**
- `400 Bad Request` - No file provided
- `500 Internal Server Error` - Upload failed

---

## Error Responses

All endpoints may return the following error responses:

**500 Internal Server Error:**
```json
{
  "error": "Database not connected"
}
```

**400 Bad Request:**
```json
{
  "error": "Missing required data"
}
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- File uploads use `multipart/form-data`
- Most endpoints require the backend to be connected to Firestore
- AI features require GEMINI_API_KEY and DEEPGRAM_API_KEY environment variables
- Media uploads require Cloudinary credentials
