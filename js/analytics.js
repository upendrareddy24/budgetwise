/**
 * Analytics Module - Financial insights and calculations
 */

const Analytics = {
    // Get transactions for a specific period
    getTransactionsByPeriod(transactions, period) {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            switch (period) {
                case 'today':
                    return transactionDate >= startOfDay;
                case 'week':
                    return transactionDate >= startOfWeek;
                case 'month':
                    return transactionDate >= startOfMonth;
                case 'year':
                    return transactionDate >= startOfYear;
                default:
                    return true;
            }
        });
    },

    // Calculate total income
    getTotalIncome(transactions) {
        return transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    },

    // Calculate total expenses
    getTotalExpenses(transactions) {
        return transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    },

    // Calculate balance
    getBalance(transactions) {
        return this.getTotalIncome(transactions) - this.getTotalExpenses(transactions);
    },

    // Get spending by category
    getSpendingByCategory(transactions) {
        const categoryTotals = {};

        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                if (!categoryTotals[t.category]) {
                    categoryTotals[t.category] = 0;
                }
                categoryTotals[t.category] += parseFloat(t.amount);
            });

        return categoryTotals;
    },

    // Get top spending categories
    getTopCategories(transactions, limit = 5) {
        const categoryTotals = this.getSpendingByCategory(transactions);
        return Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([category, amount]) => ({ category, amount }));
    },

    // Calculate budget utilization
    getBudgetUtilization(transactions, budgets) {
        const spending = this.getSpendingByCategory(transactions);
        const utilization = {};

        Object.keys(budgets).forEach(category => {
            if (budgets[category] > 0) {
                const spent = spending[category] || 0;
                utilization[category] = {
                    budget: budgets[category],
                    spent: spent,
                    remaining: budgets[category] - spent,
                    percentage: (spent / budgets[category]) * 100
                };
            }
        });

        return utilization;
    },

    // Get spending trend (last 6 months)
    getSpendingTrend(transactions, months = 6) {
        const trend = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthTransactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate.getMonth() === monthDate.getMonth() &&
                    tDate.getFullYear() === monthDate.getFullYear();
            });

            trend.push({
                month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                income: this.getTotalIncome(monthTransactions),
                expenses: this.getTotalExpenses(monthTransactions)
            });
        }

        return trend;
    },

    // Calculate average daily spending
    getAverageDailySpending(transactions) {
        if (transactions.length === 0) return 0;

        const expenses = transactions.filter(t => t.type === 'expense');
        if (expenses.length === 0) return 0;

        const dates = expenses.map(t => new Date(t.date).toDateString());
        const uniqueDays = new Set(dates).size;
        const totalExpenses = this.getTotalExpenses(expenses);

        return totalExpenses / uniqueDays;
    },

    // Predict end-of-month spending
    predictMonthEndSpending(transactions) {
        const now = new Date();
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        const monthTransactions = this.getTransactionsByPeriod(transactions, 'month');
        const currentSpending = this.getTotalExpenses(monthTransactions);
        const avgDaily = this.getAverageDailySpending(monthTransactions);

        const remainingDays = daysInMonth - dayOfMonth;
        const predictedTotal = currentSpending + (avgDaily * remainingDays);

        return {
            current: currentSpending,
            predicted: predictedTotal,
            daysRemaining: remainingDays
        };
    },

    // Compare with previous month
    compareWithPreviousMonth(transactions) {
        const now = new Date();
        const thisMonth = this.getTransactionsByPeriod(transactions, 'month');

        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const lastMonth = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= lastMonthStart && tDate <= lastMonthEnd;
        });

        const thisMonthExpenses = this.getTotalExpenses(thisMonth);
        const lastMonthExpenses = this.getTotalExpenses(lastMonth);
        const difference = thisMonthExpenses - lastMonthExpenses;
        const percentageChange = lastMonthExpenses > 0
            ? (difference / lastMonthExpenses) * 100
            : 0;

        return {
            thisMonth: thisMonthExpenses,
            lastMonth: lastMonthExpenses,
            difference: difference,
            percentageChange: percentageChange,
            trend: difference > 0 ? 'up' : 'down'
        };
    }
};
