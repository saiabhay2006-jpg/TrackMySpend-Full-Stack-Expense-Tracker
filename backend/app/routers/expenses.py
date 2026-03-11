from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, auth

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)

@router.post("/", response_model=schemas.ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    new_expense = models.Expense(**expense.model_dump(), user_id=current_user.id)
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.get("/", response_model=List[schemas.ExpenseResponse])
def get_expenses(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user), skip: int = 0, limit: int = 100):
    expenses = db.query(models.Expense).filter(models.Expense.user_id == current_user.id).offset(skip).limit(limit).all()
    return expenses

@router.get("/{id}", response_model=schemas.ExpenseResponse)
def get_expense(id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    expense = db.query(models.Expense).filter(models.Expense.id == id, models.Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Expense with id {id} not found")
    return expense

@router.put("/{id}", response_model=schemas.ExpenseResponse)
def update_expense(id: int, updated_expense: schemas.ExpenseCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    expense_query = db.query(models.Expense).filter(models.Expense.id == id, models.Expense.user_id == current_user.id)
    expense = expense_query.first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Expense with id {id} not found")
    
    expense_query.update(updated_expense.model_dump(), synchronize_session=False)
    db.commit()
    return expense_query.first()

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    expense_query = db.query(models.Expense).filter(models.Expense.id == id, models.Expense.user_id == current_user.id)
    expense = expense_query.first()
    
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Expense with id {id} not found")

    expense_query.delete(synchronize_session=False)
    db.commit()
    return {"message": "done"}
