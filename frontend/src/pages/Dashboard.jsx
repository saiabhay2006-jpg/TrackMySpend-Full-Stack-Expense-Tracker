import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CategoryPieChart } from '../components/Charts';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [insights, setInsights] = useState(null);
    const [budgetInput, setBudgetInput] = useState('');
    const [loading, setLoading] = useState(true);

    const loadInsights = async () => {
        try {
            const res = await api.get('/budget/insights');
            setInsights(res.data);
            setBudgetInput(res.data.monthly_budget);
            setLoading(false);
        } catch (e) {
            console.error("Failed to load insights", e);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInsights();
    }, []);

    const updateBudget = async (e) => {
        e.preventDefault();
        try {
            await api.post('/budget/', { monthly_budget: parseFloat(budgetInput) });
            loadInsights();
            alert("Budget updated successfully!");
        } catch (e) {
            console.error("Failed to update budget", e);
        }
    };

    if (loading) return <div className="text-center mt-5">Loading Dashboard...</div>;

    const percentage = insights.monthly_budget > 0 ? (insights.total_spending / insights.monthly_budget) * 100 : 0;
    const progressColor = percentage > 80 ? 'bg-danger' : percentage > 50 ? 'bg-warning' : 'bg-success';

    return (
        <div>
            <h1 className="dashboard-title">
                Welcome, {user?.name || "User"}
            </h1>

            {insights.alerts && insights.alerts.length > 0 && (
                <div className="mb-4">
                    {insights.alerts.map((alert, idx) => (
                        <div key={idx} className="alert alert-warning fw-bold">{alert}</div>
                    ))}
                </div>
            )}

            <div className="row">
                <div className="col-md-4">
                    <div className="dashboard-card bg-primary text-white">
                        <h5>Total Monthly Spending</h5>
                        <h2 className="mb-0">₹{insights.total_spending.toFixed(2)}</h2>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="dashboard-card bg-success text-white">
                        <h5>Monthly Budget</h5>
                        <h2 className="mb-0">₹{insights.monthly_budget.toFixed(2)}</h2>
                    </div>
                </div>
                <div className="col-md-4 d-flex align-items-center justify-content-center">
                    <Link to="/expenses" className="btn btn-outline-primary btn-lg w-100 h-100 d-flex align-items-center justify-content-center dashboard-card border-primary">
                        Manage Expenses
                    </Link>
                </div>
            </div>

            <div className="row mt-2">
                <div className="col-md-6">
                    <div className="dashboard-card">
                        <h5 className="mb-3">Set Monthly Budget</h5>
                        <form onSubmit={updateBudget} className="d-flex gap-2 align-items-center">
                            <input
                                className="custom-budget-input bg-[#222630] px-4 py-3 outline-none w-[280px] text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040]"
                                name="text"
                                placeholder="Enter Monthly budget"
                                type="text"
                                value={budgetInput}
                                onChange={(e) => setBudgetInput(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn btn-primary h-100">Save</button>
                        </form>

                        <div className="mt-4">
                            <h6 className="mb-2">Budget Utilization: {percentage.toFixed(1)}%</h6>
                            <div className="progress" style={{ height: '20px' }}>
                                <div className={`progress-bar ${progressColor}`} role="progressbar" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="dashboard-card">
                        <h5 className="mb-3 text-center">Spending by Category</h5>
                        <div className="chart-container">
                            <CategoryPieChart categories={insights.categories} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
