import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        amount: '',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [isEditing, setIsEditing] = useState(false);
    const [currentEditId, setCurrentEditId] = useState(null);

    const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Housing', 'Utilities', 'Health', 'Other'];

    const fetchExpenses = async () => {
        try {
            const res = await api.get('/expenses/');
            setExpenses(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/expenses/${currentEditId}`, formData);
                setIsEditing(false);
                setCurrentEditId(null);
            } else {
                await api.post('/expenses/', formData);
            }
            setFormData({
                amount: '',
                category: 'Food',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
            fetchExpenses();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (expense) => {
        setFormData({
            amount: expense.amount,
            category: expense.category,
            description: expense.description || '',
            date: expense.date
        });
        setIsEditing(true);
        setCurrentEditId(expense.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await api.delete(`/expenses/${id}`);
                fetchExpenses();
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (loading) return <div className="text-center mt-5">Loading Expenses...</div>;

    return (
        <div>
            <h2 className="mb-4 text-primary">Manage Expenses</h2>

            <div className="row">
                <div className="col-lg-4 mb-4">
                    <div className="dashboard-card shadow-sm border-0">
                        <div className="card-body">
                            <h5 className="card-title mb-4">{isEditing ? 'Edit Expense' : 'Add New Expense'}</h5>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label text-muted">Amount (₹)</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        className="form-control"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted">Category</label>
                                    <select
                                        name="category"
                                        className="form-select"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        className="form-control"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted">Description (Optional)</label>
                                    <input
                                        type="text"
                                        name="description"
                                        className="form-control"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="E.g., Dinner at restaurant"
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100">
                                    {isEditing ? 'Update Expense' : 'Save Expense'}
                                </button>
                                {isEditing && (
                                    <button
                                        type="button"
                                        className="btn btn-secondary w-100 mt-2"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({
                                                amount: '',
                                                category: 'Food',
                                                description: '',
                                                date: new Date().toISOString().split('T')[0]
                                            });
                                        }}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-8">
                    <div className="dashboard-card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <h5 className="card-title mb-4">Expense History</h5>

                            {expenses.length === 0 ? (
                                <p className="text-muted text-center pt-5">No expenses recorded yet. Add one to see it here!</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Date</th>
                                                <th>Category</th>
                                                <th>Description</th>
                                                <th>Amount (₹)</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expenses.map(expense => (
                                                <tr key={expense.id} className="expense-item">
                                                    <td>{expense.date}</td>
                                                    <td><span className="badge bg-secondary">{expense.category}</span></td>
                                                    <td>{expense.description || '-'}</td>
                                                    <td className="fw-bold text-danger">₹{expense.amount.toFixed(2)}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-primary me-2 shadow-sm"
                                                            onClick={() => handleEdit(expense)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger shadow-sm"
                                                            onClick={() => handleDelete(expense.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Expenses;
