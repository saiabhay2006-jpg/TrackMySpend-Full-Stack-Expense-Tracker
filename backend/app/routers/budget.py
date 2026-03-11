from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, schemas, database, auth

router = APIRouter(
    prefix="/budget",
    tags=["Budget"]
)

@router.post("/", response_model=schemas.BudgetResponse, status_code=status.HTTP_201_CREATED)
def set_budget(budget: schemas.BudgetCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    existing_budget = db.query(models.Budget).filter(models.Budget.user_id == current_user.id).first()
    
    if existing_budget:
        existing_budget.monthly_budget = budget.monthly_budget
        db.commit()
        db.refresh(existing_budget)
        return existing_budget
    else:
        new_budget = models.Budget(**budget.model_dump(), user_id=current_user.id)
        db.add(new_budget)
        db.commit()
        db.refresh(new_budget)
        return new_budget

@router.get("/", response_model=schemas.BudgetResponse)
def get_budget(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    budget = db.query(models.Budget).filter(models.Budget.user_id == current_user.id).first()
    if not budget:
        # Default budget if not set
        return {"id": 0, "user_id": current_user.id, "monthly_budget": 0}
    return budget

@router.get("/insights")
def get_insights(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Calculate total spending
    total_spending = db.query(func.sum(models.Expense.amount)).filter(models.Expense.user_id == current_user.id).scalar() or 0.0

    # Get budget
    budget = db.query(models.Budget).filter(models.Budget.user_id == current_user.id).first()
    monthly_budget = budget.monthly_budget if budget else 0.0

    alerts = []
    
    # 1. Budget Warning Alert
    if monthly_budget > 0:
        spending_percentage = (total_spending / monthly_budget) * 100
        if spending_percentage >= 80:
            alerts.append(f"Warning: You have used {spending_percentage:.1f}% of your monthly budget.")

    # 2. Category insights
    category_spending = db.query(models.Expense.category, func.sum(models.Expense.amount).label('total')).filter(models.Expense.user_id == current_user.id).group_by(models.Expense.category).all()
    
    for category, amount in category_spending:
        if total_spending > 0:
            cat_percentage = (amount / total_spending) * 100
            if cat_percentage > 40:
                alerts.append(f"Insight: You spend {cat_percentage:.1f}% of your money on {category}.")

    # Category breakdown for charts
    categories = [{"category": c, "amount": a} for c, a in category_spending]

    return {
        "total_spending": total_spending,
        "monthly_budget": monthly_budget,
        "alerts": alerts,
        "categories": categories
    }
