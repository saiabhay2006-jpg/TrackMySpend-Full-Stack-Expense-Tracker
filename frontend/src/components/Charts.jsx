import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export const CategoryPieChart = ({ categories }) => {
    if (!categories || categories.length === 0) {
        return <p className="text-muted text-center pt-5">No expense data to chart.</p>;
    }

    const data = {
        labels: categories.map(c => c.category),
        datasets: [
            {
                label: 'Spending by Category (₹)',
                data: categories.map(c => c.amount),
                backgroundColor: [
                    '#0d6efd',
                    '#dc3545',
                    '#ffc107',
                    '#198754',
                    '#6f42c1',
                    '#0dcaf0',
                    '#fd7e14',
                    '#20c997'
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: false
            }
        }
    };

    return <Pie data={data} options={options} />;
};
