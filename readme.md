Step 1: Clone the Repository



Step 2: Setup Backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
uvicorn app.main:app --reload --port 8000
Backend will now run at http://127.0.0.1:8000.
FastAPI docs available at http://127.0.0.1:8000/docs.



Step 3: Setup Frontend

Open a new terminal, then:

cd D:\projects\your-repo\frontend

# Install Node.js dependencies
npm install

# Run frontend dev server
npm run dev
Frontend will now run at http://localhost:3000.



Step 1: Clone the Repository



Step 2: Setup Backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
uvicorn app.main:app --reload --port 8000
Backend will now run at http://127.0.0.1:8000.
FastAPI docs available at http://127.0.0.1:8000/docs.



Step 3: Setup Frontend

Open a new terminal, then:

cd D:\projects\your-repo\frontend

# Install Node.js dependencies
npm install

# Run frontend dev server
npm run dev
Frontend will now run at http://localhost:3000.














and setup this backend/


DATABASE_URL=ssl=disable
REDIS_URL=redis://localhost:6379
SECRET_KEY=soc@4565ialfeedsocialfeedsocialfeedsocialfeedsocialfeedskgnwirtu24r@3@3@
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
APP_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7



and frontend/

NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1










and setup this backend/


DATABASE_URL=ssl=disable
REDIS_URL=redis://localhost:6379
SECRET_KEY=soc@4565ialfeedsocialfeedsocialfeedsocialfeedsocialfeedskgnwirtu24r@3@3@
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
APP_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7



and frontend/

NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1