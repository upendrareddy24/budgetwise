/**
 * Charts Module - Data visualization using Chart.js
 */

const Charts = {
    categoryChart: null,
    trendChart: null,

    // Category colors
    categoryColors: {
        food: '#ef4444',
        transport: '#f59e0b',
        shopping: '#8b5cf6',
        bills: '#3b82f6',
        entertainment: '#ec4899',
        health: '#10b981',
        education: '#6366f1',
        other: '#64748b'
    },

    // Initialize category pie chart
    initCategoryChart(transactions) {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        const spending = Analytics.getSpendingByCategory(transactions);
        const categories = Object.keys(spending);
        const amounts = Object.values(spending);

        if (this.categoryChart) {
            this.categoryChart.destroy();
        }

        if (categories.length === 0) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            return;
        }

        this.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories.map(c => this.getCategoryLabel(c)),
                datasets: [{
                    data: amounts,
                    backgroundColor: categories.map(c => this.categoryColors[c] || '#64748b'),
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    // Initialize trend line chart
    initTrendChart(transactions) {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        const trend = Analytics.getSpendingTrend(transactions, 6);
        const labels = trend.map(t => t.month);
        const incomeData = trend.map(t => t.income);
        const expenseData = trend.map(t => t.expenses);

        if (this.trendChart) {
            this.trendChart.destroy();
        }

        if (trend.length === 0) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            return;
        }

        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y || 0;
                                return `${label}: $${value.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return '$' + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
    },

    // Update all charts
    updateCharts(transactions) {
        this.initCategoryChart(transactions);
        this.initTrendChart(transactions);
    },

    // Get category label with emoji
    getCategoryLabel(category) {
        const labels = {
            food: '🍔 Food & Dining',
            transport: '🚗 Transportation',
            shopping: '🛍️ Shopping',
            bills: '💡 Bills & Utilities',
            entertainment: '🎬 Entertainment',
            health: '🏥 Healthcare',
            education: '📚 Education',
            other: '📦 Other'
        };
        return labels[category] || category;
    }
};
