# Installation Troubleshooting Guide

Common issues and solutions when installing the HRM backend.

## Issue 1: Django and djongo Dependency Conflict

### Error Message:
```
ERROR: Cannot install -r requirements.txt (line 1) and -r requirements.txt (line 5) 
because these package versions have conflicting dependencies.
The conflict is caused by:
    django 5.0.1 depends on sqlparse>=0.3.1
    djongo 1.3.6 depends on sqlparse==0.2.4
```

### Solution: Use PostgreSQL or SQLite (Recommended)

**We recommend using PostgreSQL or SQLite instead of MongoDB for this HRM system.**

```bash
# Install base requirements (without MongoDB)
pip install -r requirements.txt

# This installs:
# - Django 5.0.1
# - Django REST Framework
# - CORS headers
# - PostgreSQL support (psycopg2-binary)
# - SQLite support (built into Python)
```

### Why Not MongoDB?

1. **Dependency conflicts** - djongo doesn't support Django 5.0+
2. **Better fit** - HRM has clear relationships (Employee → Attendance)
3. **Simpler setup** - No additional database driver issues
4. **Production ready** - PostgreSQL is battle-tested for HRM systems

### If You Still Want MongoDB

#### Option A: Downgrade Django (Not Recommended)

```bash
# Uninstall conflicting packages
pip uninstall django djongo pymongo -y

# Install Django 4.2 LTS with djongo
pip install Django==4.2.0
pip install djongo==1.3.6
pip install pymongo==3.12.3
pip install djangorestframework==3.14.0
pip install django-cors-headers==4.3.1
pip install python-decouple==3.8
pip install python-dotenv==1.0.0
```

#### Option B: Use djongo Fork (Advanced)

```bash
# Install from fork that supports newer Django
pip install -r requirements.txt
pip uninstall djongo -y
pip install git+https://github.com/doableware/djongo.git
pip install pymongo>=4.0,<5.0
```

**Note**: Both options may have stability issues.

---

## Issue 2: PostgreSQL Installation Issues

### Error: `pg_config executable not found`

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install libpq-dev python3-dev

# macOS
brew install postgresql

# Then retry
pip install psycopg2-binary
```

### Error: PostgreSQL Connection Failed

Check PostgreSQL is running:

```bash
# Ubuntu/Debian
sudo systemctl status postgresql
sudo systemctl start postgresql

# macOS
brew services start postgresql

# Windows
# Check Services app for PostgreSQL service
```

---

## Issue 3: Python Version Issues

### Minimum Python Version: 3.8

Check your version:
```bash
python --version
# or
python3 --version
```

If too old:
```bash
# Ubuntu/Debian
sudo apt-get install python3.10

# macOS
brew install python@3.10

# Windows
# Download from python.org
```

---

## Issue 4: Virtual Environment Issues

### Error: `venv` module not found

```bash
# Ubuntu/Debian
sudo apt-get install python3-venv

# Then create venv
python3 -m venv venv
```

### Error: Virtual environment not activating

```bash
# Windows PowerShell (if scripts disabled)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then activate
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

---

## Issue 5: pip Issues

### Error: `pip` not found

```bash
# Install pip
python -m ensurepip --upgrade

# Or
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python get-pip.py
```

### Error: pip version too old

```bash
python -m pip install --upgrade pip
```

---

## Recommended Installation Path

### For Development (Easiest):

```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 3. Upgrade pip
pip install --upgrade pip

# 4. Install requirements (SQLite by default)
pip install -r requirements.txt

# 5. Configure for SQLite (already default)
cp .env.example .env
# .env will use SQLite by default (no DB_ENGINE needed)

# 6. Run migrations
python manage.py migrate

# 7. Create superuser
python manage.py createsuperuser

# 8. Start server
python manage.py runserver
```

### For Production (PostgreSQL):

```bash
# 1-3. Same as above

# 4. Install requirements
pip install -r requirements.txt

# 5. Install PostgreSQL
# (See README.md for PostgreSQL installation)

# 6. Create PostgreSQL database
sudo -u postgres psql
CREATE DATABASE hrm_db;
CREATE USER hrm_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hrm_db TO hrm_user;
\q

# 7. Configure .env
cp .env.example .env
# Edit .env:
# DB_ENGINE=postgresql
# DB_NAME=hrm_db
# DB_USER=hrm_user
# DB_PASSWORD=your_password
# DB_HOST=localhost
# DB_PORT=5432

# 8. Run migrations
python manage.py migrate

# 9. Create superuser
python manage.py createsuperuser

# 10. Start server
python manage.py runserver
```

---

## Quick Verification

After installation, verify everything works:

```bash
# 1. Check Django version
python manage.py --version
# Should show: 5.0.1

# 2. Check if migrations work
python manage.py showmigrations
# Should show employee migrations

# 3. Test server
python manage.py runserver
# Open http://localhost:8000/api/employees/

# 4. Run tests
python manage.py test
# Should pass all tests
```

---

## Clean Installation (If All Else Fails)

```bash
# 1. Delete virtual environment
rm -rf venv  # Linux/macOS
# or
rmdir /s venv  # Windows

# 2. Delete any pip cache
pip cache purge

# 3. Start fresh
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install --upgrade pip
pip install -r requirements.txt

# 4. If that works, proceed with migrations
python manage.py migrate
```

---

## Database Choice Summary

| Database | Installation | This Project | Recommendation |
|----------|--------------|--------------|----------------|
| **SQLite** | ✅ None needed | ✅ Perfect for dev | ⭐⭐⭐⭐⭐ Start here |
| **PostgreSQL** | Medium | ✅ Perfect for prod | ⭐⭐⭐⭐⭐ Use in prod |
| **MongoDB** | Hard (conflicts) | ⚠️ Not ideal | ⭐⭐ Skip it |

---

## Still Having Issues?

1. **Check Python version**: Must be 3.8+
2. **Use virtual environment**: Always!
3. **Upgrade pip**: `pip install --upgrade pip`
4. **One requirement at a time**: Install packages individually to identify the problem
5. **Check logs**: Read error messages carefully
6. **Skip MongoDB**: Use SQLite or PostgreSQL instead

## Contact & Support

- Check the error message carefully
- Search the error on Stack Overflow
- Ensure you're using a virtual environment
- Try a clean installation as shown above

---

## Success Checklist

Once installed, you should be able to:

- [ ] Activate virtual environment (see `(venv)` in prompt)
- [ ] Run `python manage.py --version` (shows 5.0.1)
- [ ] Run `python manage.py migrate` (creates tables)
- [ ] Run `python manage.py runserver` (starts server)
- [ ] Open `http://localhost:8000/api/employees/` (shows empty list)
- [ ] Run `python manage.py test` (all tests pass)

If all checked, you're good to go! 🎉
