from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .routers import users, expenses, budget

# Create all tables in the database
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Smart Expense Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(expenses.router)
app.include_router(budget.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Smart Expense Tracker API"}
