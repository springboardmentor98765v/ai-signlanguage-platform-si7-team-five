# Real-Time Gamification API Guide

## Overview
This guide explains the real-time gamification system with separate APIs for badges, streaks, and leaderboard, all integrated to work together seamlessly.

## ✅ Implemented Features

### 1. Badge API (`/api/v1/badges`)
**Purpose**: Manage user achievement badges with real-time updates

**Endpoints**:
- `POST /api/v1/badges/award` - Award a badge to a user
- `GET /api/v1/badges/{user_id}` - Get all badges for a user
- `POST /api/v1/badges/check` - Check practice data and award eligible badges
- `GET /api/v1/badges/definitions` - Get all available badge definitions
- `PUT /api/v1/badges/{badge_id}/hide` - Hide a badge from display
- `WS /api/v1/ws/badges` - WebSocket for real-time badge updates

**Badge Types**:
- `first_practice` - First Steps (10 points)
- `streak_3` - On Fire (50 points)
- `streak_7` - Week Warrior (100 points)
- `streak_30` - Monthly Master (500 points)
- `alphabet_master` - Alphabet Master (200 points)
- `perfect_score` - Perfectionist (150 points)
- `speed_demon` - Speed Demon (300 points)
- `night_owl` - Night Owl (75 points)

### 2. Streak API (`/api/v1/streaks`)
**Purpose**: Track and maintain user practice streaks with real-time updates

**Endpoints**:
- `POST /api/v1/streaks/update` - Update user's streak based on practice
- `GET /api/v1/streaks/{user_id}` - Get current streak information
- `GET /api/v1/streaks/{user_id}/status` - Check if streak is active or needs reset
- `GET /api/v1/streaks/leaderboard` - Get users with highest streaks
- `PUT /api/v1/streaks/{user_id}/reset` - Manually reset a user's streak (admin)
- `WS /api/v1/ws/streaks` - WebSocket for real-time streak updates

**Streak Logic**:
- Consecutive days: Increment streak
- Missed day: Reset streak to 1
- Same day: No change
- Auto-awards streak badges at milestones (3, 7, 30 days)

### 3. Leaderboard API (`/api/v1/leaderboard`)
**Purpose**: Real-time leaderboard management and rankings

**Endpoints**:
- `GET /api/v1/leaderboard` - Get leaderboard with time range filtering
- `GET /api/v1/leaderboard/{user_id}` - Get specific user's rank
- `POST /api/v1/leaderboard/update` - Update leaderboard after practice
- `POST /api/v1/leaderboard/bonus` - Add bonus points for achievements
- `POST /api/v1/leaderboard/reset-weekly` - Reset weekly points (admin)
- `GET /api/v1/leaderboard/summary` - Get leaderboard statistics
- `WS /api/v1/ws/leaderboard` - WebSocket for real-time leaderboard updates

**Time Ranges**:
- `all` - All-time rankings
- `week` - Weekly rankings
- `month` - Monthly rankings

**Points System**:
- Practice completion: 10 points
- Perfect score: 20 points
- Streak day: 5 points per day
- Badge earned: 50 points
- Level up: 100 points

### 4. Gamification Integration API (`/api/v1/gamification`)
**Purpose**: Coordinate all gamification systems in real-time

**Endpoints**:
- `POST /api/v1/gamification/practice-complete` - Process practice and update all systems
- `GET /api/v1/gamification/summary/{user_id}` - Get comprehensive user summary
- `GET /api/v1/gamification/leaderboard` - Get global leaderboard with integrated data

## 🔗 Real-Time Integration

### Practice Completion Flow
When a user completes a practice session:

1. **Streak Update**: Updates streak based on practice history
2. **Badge Check**: Evaluates practice data and awards eligible badges
3. **Leaderboard Update**: Calculates points and updates rank
4. **XP Calculation**: Totals XP from all sources
5. **Real-time Notifications**: WebSocket broadcasts updates

### Integration Points
- **Streak → Badges**: Milestone streaks automatically award badges
- **Badges → Leaderboard**: Badge awards trigger bonus points
- **Leaderboard → Streaks**: Weekly leaderboard considers streak bonuses
- **All → XP**: XP calculated from all gamification activities

## 📊 Database Schema

### Tables Created:
- `gamification_badges` - User achievement badges
- `gamification_streaks` - User practice streaks
- `gamification_leaderboard` - Leaderboard entries

### Key Relationships:
- Badges linked to user_id
- Streaks unique per user_id
- Leaderboard entries unique per user_id

## 🧪 Testing via Swagger UI

### Test Badge API:
1. Navigate to `http://localhost:8000/bd_logic/docs`
2. Find `POST /api/v1/badges/award`
3. Enter parameters:
   ```json
   {
     "user_id": 1,
     "badge_type": "first_practice"
   }
   ```
4. Execute and see badge awarded

### Test Streak API:
1. Find `POST /api/v1/streaks/update`
2. Enter user_id: `1`
3. Execute and see streak updated

### Test Leaderboard API:
1. Find `POST /api/v1/leaderboard/update`
2. Enter parameters:
   ```json
   {
     "user_id": 1,
     "practice_data": {
       "accuracy": 95,
       "speed_bonus": true
     }
   }
   ```
3. Execute and see leaderboard updated

### Test Integration API:
1. Find `POST /api/v1/gamification/practice-complete`
2. Enter parameters:
   ```json
   {
     "user_id": 1,
     "practice_data": {
       "accuracy": 95,
       "speed_bonus": true,
       "daily_practices": 1
     }
   }
   ```
3. Execute and see all systems updated together

## 🔌 WebSocket Support

### WebSocket Endpoints:
- `WS /api/v1/ws/badges` - Real-time badge notifications
- `WS /api/v1/ws/streaks` - Real-time streak updates
- `WS /api/v1/ws/leaderboard` - Real-time leaderboard changes

### WebSocket Usage:
```javascript
// Connect to badge WebSocket
const badgeSocket = new WebSocket('ws://localhost:8000/bd_logic/api/v1/ws/badges');

badgeSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'badge_awarded') {
        console.log('New badge awarded:', data.badge);
    }
};
```

## 🎯 Usage Examples

### Complete Practice Session:
```python
import requests

# Process complete practice session
response = requests.post(
    "http://localhost:8000/bd_logic/api/v1/gamification/practice-complete",
    json={
        "user_id": 1,
        "practice_data": {
            "accuracy": 95,
            "speed_bonus": True,
            "daily_practices": 5
        }
    }
)

results = response.json()
print("Streak updated:", results["results"]["streak_update"])
print("Badges awarded:", results["results"]["badges_awarded"])
print("Leaderboard updated:", results["results"]["leaderboard_update"])
print("Total XP earned:", results["results"]["total_xp_earned"])
```

### Get User Summary:
```python
import requests

response = requests.get(
    "http://localhost:8000/bd_logic/api/v1/gamification/summary/1"
)

summary = response.json()
print("User badges:", summary["badges"])
print("Current streak:", summary["streak"])
print("Leaderboard rank:", summary["leaderboard"])
```

## 📦 Dependencies Added
- `websockets` - WebSocket support for real-time updates

## 🎨 Key Features
- ✅ Separate APIs for badges, streaks, and leaderboard
- ✅ Real-time integration between all systems
- ✅ WebSocket support for live updates
- ✅ Comprehensive gamification coordination
- ✅ Automatic badge awarding based on achievements
- ✅ Intelligent streak tracking and maintenance
- ✅ Dynamic leaderboard with multiple time ranges
- ✅ XP calculation and leveling system
- ✅ Swagger UI compatible for testing
- ✅ Practice completion workflow integration

## 🔧 Technical Implementation

### Key Files Created:
1. `BD_Logic/model/gamification.py` - Database models
2. `BD_Logic/services/badge_service.py` - Badge logic
3. `BD_Logic/services/streak_service.py` - Streak logic
4. `BD_Logic/services/leaderboard_service.py` - Leaderboard logic
5. `BD_Logic/services/gamification_integration.py` - Integration coordination
6. `BD_Logic/api/badge_api.py` - Badge endpoints
7. `BD_Logic/api/streak_api.py` - Streak endpoints
8. `BD_Logic/api/leaderboard_api.py` - Leaderboard endpoints
9. `BD_Logic/api/gamification_api.py` - Integration endpoints
10. Schema files for all APIs

### Integration Flow:
```
Practice Complete → Gamification Integration Service
                    ↓
                    ├→ Streak Service → Update streak → Award streak badges
                    ├→ Badge Service → Check eligibility → Award badges
                    └→ Leaderboard Service → Calculate points → Update rank
                    ↓
                    Return comprehensive results
```

## 🚀 Real-Time Capabilities
- Live badge notifications when achievements are unlocked
- Instant streak updates as users practice
- Dynamic leaderboard changes reflecting real-time performance
- WebSocket connections for continuous updates
- Event-driven architecture for responsiveness

The implementation provides a complete, real-time gamification system where badges, streaks, and leaderboard work together seamlessly to enhance user engagement and motivation.


# Export Functionality Guide

## Overview
This guide explains the export functionality for reports and certificates, supporting CSV, PDF, and Excel formats with proper file download capabilities via Swagger UI.

## ✅ Implemented Features

### 1. Report Export (`/bd_logic/api/v1/export`)
- **Endpoint**: `POST /bd_logic/api/v1/export`
- **Formats**: JSON, CSV, PDF, Excel (XLSX)
- **File Download**: Yes, with proper content headers

#### Request Format:
```json
{
  "user_id": 1,
  "student_name": "John Doe",
  "export_type": "csv"  // Options: json, csv, pdf, excel, xlsx
}
```

#### Response:
- For CSV/PDF/Excel: File download with proper content headers
- For JSON: File download with JSON content type
- For errors: JSON error message

### 2. Certificate Export (`/bd_logic/api/v1/certificate/export`)
- **Endpoint**: `POST /bd_logic/api/v1/certificate/export`
- **Formats**: CSV, PDF, Excel (XLSX)
- **File Download**: Yes, with proper content headers
- **Eligibility**: Average score >= 85%

#### Request Parameters:
- `user_id`: User ID (required)
- `student_name`: Student name (required)
- `export_format`: Export format (csv, pdf, excel, xlsx)
- `course_name`: Course name (optional, default: "Sign Language Mastery")

#### Response:
- For CSV/PDF/Excel: Professional certificate file download
- For ineligible students: Error message
- For errors: JSON error message

### 3. Helper Endpoints

#### Get Supported Export Formats
- **Endpoint**: `GET /bd_logic/api/v1/export/formats`
- **Response**: List of supported formats with descriptions

#### Get Supported Certificate Formats
- **Endpoint**: `GET /bd_logic/api/v1/certificate/formats`
- **Response**: List of supported formats and eligibility requirements

## 📋 Format Details

### CSV Export
- **Content-Type**: `text/csv`
- **File Extension**: `.csv`
- **Features**: 
  - Proper field-value mapping
  - Compatible with Excel, Google Sheets
  - Easy data analysis

### PDF Export
- **Content-Type**: `application/pdf`
- **File Extension**: `.pdf`
- **Features**:
  - Professional formatting
  - Color-coded tables
  - Print-ready quality
  - For reports: Clean table layout
  - For certificates: Professional certificate design with borders

### Excel Export
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **File Extension**: `.xlsx`
- **Features**:
  - Green header formatting
  - Auto-adjusted column widths
  - Professional appearance
  - Multiple sheet support capability

## 🧪 Testing via Swagger UI

### Steps to Test:
1. Start the backend server:
   ```bash
   cd Backend
   python main.py
   ```

2. Open Swagger UI:
   - Navigate to `http://localhost:8000/docs`
   - Or `http://localhost:8000/bd_logic/docs` for BD_Logic endpoints

3. Test Report Export:
   - Find `POST /bd_logic/api/v1/export`
   - Click "Try it out"
   - Enter parameters:
     ```json
     {
       "user_id": 1,
       "student_name": "TestStudent",
       "export_type": "pdf"
     }
     ```
   - Click "Execute"
   - Click "Download file" in the response

4. Test Certificate Export:
   - Find `POST /bd_logic/api/v1/certificate/export`
   - Click "Try it out"
   - Enter parameters:
     - user_id: `1`
     - student_name: `TestStudent`
     - export_format: `pdf`
     - course_name: `Sign Language Mastery`
   - Click "Execute"
   - Click "Download file" in the response

## 🔧 Technical Implementation

### Key Files Modified:
1. `BD_Logic/exports/export_engine.py` - Export engine with file download support
2. `BD_Logic/exports/export_service.py` - Export service coordination
3. `BD_Logic/api/export_api.py` - Export API endpoints
4. `BD_Logic/certificates/certificate_engine.py` - Certificate generation and export
5. `BD_Logic/certificates/certificates_service.py` - Certificate service
6. `BD_Logic/api/certificate_api.py` - Certificate API endpoints
7. `requirements.txt` - Added reportlab, openpyxl, xlsxwriter

### Content Headers:
All file downloads include proper headers:
```python
headers={
    "Content-Disposition": f"attachment; filename={filename}.{extension}"
}
```

### StreamingResponse:
Uses FastAPI's `StreamingResponse` for efficient file downloads:
```python
return StreamingResponse(
    output,
    media_type="application/pdf",
    headers={"Content-Disposition": f"attachment; filename={filename}.pdf"}
)
```

## 📦 Dependencies Added
- `reportlab` - PDF generation
- `openpyxl` - Excel file handling
- `xlsxwriter` - Excel file creation with formatting
- `pandas` - Data manipulation (already present)

## 🎯 Usage Examples

### Python Script Example:
```python
import requests

# Export report as PDF
response = requests.post(
    "http://localhost:8000/bd_logic/api/v1/export",
    json={
        "user_id": 1,
        "student_name": "John Doe",
        "export_type": "pdf"
    }
)

# Save the file
with open("report.pdf", "wb") as f:
    f.write(response.content)

# Export certificate as Excel
response = requests.post(
    "http://localhost:8000/bd_logic/api/v1/certificate/export",
    params={
        "user_id": 1,
        "student_name": "John Doe",
        "export_format": "excel"
    }
)

# Save the file
with open("certificate.xlsx", "wb") as f:
    f.write(response.content)
```

## 🐛 Troubleshooting

### Issue: Port already in use
- **Solution**: Change port in `main.py` or stop the existing server

### Issue: Missing dependencies
- **Solution**: Run `pip install reportlab openpyxl xlsxwriter`

### Issue: Certificate not eligible
- **Solution**: Ensure user has average score >= 85%

### Issue: File not downloading in Swagger
- **Solution**: Check browser popup settings, click "Download file" link in response

## ✨ Features
- ✅ Multiple format support (CSV, PDF, Excel)
- ✅ Professional file formatting
- ✅ Proper content headers for browser download
- ✅ Swagger UI compatible
- ✅ Certificate eligibility checking
- ✅ Error handling and validation
- ✅ Professional certificate design
- ✅ Color-coded Excel formatting
- ✅ Auto-adjusted column widths
- ✅ Print-ready PDF quality

## 📝 Notes
- All exports are generated in memory for efficiency
- Files are not stored on the server (download-only)
- Certificate design is professional and print-ready
- Excel exports include professional formatting
- PDF exports include proper page layouts
- CSV exports are compatible with major spreadsheet applications