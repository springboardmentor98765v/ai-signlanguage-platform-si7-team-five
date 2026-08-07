# Local PostgreSQL Database Setup Guide

## Issue Analysis
The remote PostgreSQL database (Supabase) has DNS resolution issues:
- Hostname: `db.ovvvcudvagbnlojfmmnx.supabase.co`
- DNS resolves to IPv6 but ping fails
- Connection error: "could not translate host name to address"

## Solution: Local PostgreSQL Setup

### Option 1: Install PostgreSQL Locally (Recommended)

#### Windows Installation:
1. Download PostgreSQL installer: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Set password: `postgres` (or update .env accordingly)
4. Ensure PostgreSQL service is running

#### Create Database:
```sql
-- Open pgAdmin or psql and run:
CREATE DATABASE sign_language_platform;
```

#### Run Schema Files:
Use the schema files from Databse_Devops directory:

```bash
# Using psql command line
psql -U postgres -d sign_language_platform -f Databse_Devops/milestone3_schema.sql
psql -U postgres -d sign_language_platform -f Databse_Devops/database_optimization.sql
psql -U postgres -d sign_language_platform -f Databse_Devops/database_integrity.sql
```

### Option 2: Use Docker (Alternative)

#### Docker Compose Setup:
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: sign_language_platform
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./Databse_Devops/milestone3_schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./Databse_Devops/database_optimization.sql:/docker-entrypoint-initdb.d/02-optimization.sql
      - ./Databse_Devops/database_integrity.sql:/docker-entrypoint-initdb.d/03-integrity.sql

volumes:
  postgres_data:
```

#### Run with Docker:
```bash
docker-compose up -d
```

### Option 3: PostgreSQL via WSL (For Windows)

#### Install in WSL:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
sudo -u postgres createuser --superuser $USER
createdb sign_language_platform
```

#### Import Schema:
```bash
psql -d sign_language_platform -f Databse_Devops/milestone3_schema.sql
```

## Configuration Updates

### Update .env File:
Current configuration is set for local PostgreSQL:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sign_language_platform
```

### Update Domain-Specific .env Files:

#### BD_Logic/.env:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sign_language_platform
```

#### Backend/.env:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sign_language_platform
```

#### AIML_CV/.env:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sign_language_platform
```

## Verification Steps

### 1. Test PostgreSQL Connection:
```bash
# Using psql
psql -U postgres -d sign_language_platform -c "SELECT version();"

# Using Python
python -c "import psycopg2; conn = psycopg2.connect('postgresql://postgres:postgres@localhost:5432/sign_language_platform'); print('Connected'); conn.close()"
```

### 2. Test Application Connection:
```bash
# BD_Logic
cd BD_Logic
python -c "from database.connection import engine; print('Database connected')"

# Backend
cd Backend  
python -c "from config import DATABASE_URL; from db import engine; print('Database connected')"

# AIML_CV
cd AIML_CV/src
python -c "from database import engine; print('Database connected')"
```

### 3. Verify Schema Installation:
```bash
psql -U postgres -d sign_language_platform -c "\dt"
```

Expected tables:
- notifications
- achievement_badges
- user_badges
- leaderboard
- user_streaks
- And other tables from milestone3_schema.sql

## Troubleshooting

### PostgreSQL Not Running:
```bash
# Windows: Check services
services.msc

# Start PostgreSQL service
net start postgresql-x64-15  # (version may vary)
```

### Connection Refused:
```bash
# Check PostgreSQL is listening
netstat -an | findstr 5432

# Check pg_hba.conf allows local connections
# Location: PostgreSQL\data\pg_hba.conf
# Add: host    all             all             127.0.0.1/32            md5
```

### Password Issues:
```bash
# Reset PostgreSQL password
psql -U postgres
ALTER USER postgres WITH PASSWORD 'postgres';
```

## Using DevOps Database Files

The Databse_Devops directory contains:
- `milestone3_schema.sql` - Main database schema
- `database_optimization.sql` - Performance optimizations
- `database_integrity.sql` - Data integrity constraints
- `database_backup_restore.sql` - Backup and restore procedures

### Apply Optimizations:
```bash
psql -U postgres -d sign_language_platform -f Databse_Devops/database_optimization.sql
```

### Apply Integrity Constraints:
```bash
psql -U postgres -d sign_language_platform -f Databse_Devops/database_integrity.sql
```

## Alternative: Remote Database Fix

If you prefer to use the remote Supabase database, you need to:

1. **Check Network Connectivity:**
   - Ensure your network allows outbound connections
   - Check firewall settings
   - Try using VPN if DNS resolution fails

2. **Use IP Address Instead:**
   ```
   DATABASE_URL=postgresql://postgres:VinayBellamkonda@<IP_ADDRESS>:5432/postgres
   ```

3. **Contact Supabase Support:**
   - Verify database credentials
   - Check if there are any IP restrictions
   - Ensure database is active

## Recommendation

For development and model training, **use local PostgreSQL** with the provided schema files. This ensures:
- No network dependency issues
- Full control over database configuration
- Faster performance for local development
- Access to all devops database features
- Better debugging capabilities

The local setup with Docker is the most reliable and portable solution.