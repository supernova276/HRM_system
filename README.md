# HRM Backend API

A comprehensive Django REST API backend and React for the Human Resource Management (HRM) system.


## Technology Stack Frontend
React 18.2.0 , Css for styling, axios 1.6.0 for AJAX calls

## Technology Stack Backend

- **Framework**: Django 5.0.1
- **API**: Django REST Framework 3.14.0
- **Database**: PostgreSQL / MongoDB / SQLite
- **CORS**: django-cors-headers

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- PostgreSQL (for SQL database) OR MongoDB (for NoSQL database) OR SQLite (built-in)




# To run frontend locally

### `clone the repository`

git clone https://github.com/supernova276/HRM_system.git

cd frontend

### `install dependencies`

npm install

### `start development server`

npm run start

### `open the browser and visit`

http://localhost:3000


# To run backend locally

### `enter the backend directory in the same cloned repository given above`

### `Create and activate a virtual environment:`

python -m venv venv
venv\Scripts\activate 

### `Install backend dependencies:`

pip install -r requirements.txt

### `Apply database migrations:`

python manage.py makemigrations / python manage.py makemigrations

python manage.py migrate

### `Start the development server:`

python manage.py runserver


### `Create superuser for admin panel`

python manage.py createsuperuser


## Limitations
not connected to postgres or mongodb, using sqlite only


