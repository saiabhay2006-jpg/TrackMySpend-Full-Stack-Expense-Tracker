import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const NavbarComponent = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark navbar-custom">
            <div className="container">
                <Link className="navbar-brand text-white" to="/dashboard">
                    Track My Spend
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        {user ? (
                            <div className="d-flex align-items-center nav-buttons">
                                <Link to="/dashboard" className={`btn btn-light mx-2 ${window.location.pathname === '/dashboard' ? 'nav-active' : ''}`}>
                                    <i className="bi bi-speedometer2 me-2"></i> Dashboard
                                </Link>

                                <Link to="/expenses" className={`btn btn-light mx-2 ${window.location.pathname === '/expenses' ? 'nav-active' : ''}`}>
                                    <i className="bi bi-wallet2 me-2"></i> Expenses
                                </Link>

                                <button onClick={handleLogout} className="btn btn-light mx-2 text-danger">
                                    <i className="bi bi-box-arrow-right me-2"></i> Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/login">Login</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/register">Register</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default NavbarComponent;
