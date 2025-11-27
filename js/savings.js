/**
 * Savings Module - AI-powered savings recommendations
 */

const Savings = {
    // Generate savings recommendations
    generateRecommendations(transactions, budgets) {
        const recommendations = [];
        const monthTransactions = Analytics.getTransactionsByPeriod(transactions, 'month');
        const spending = Analytics.getSpendingByCategory(monthTransactions);
        const comparison = Analytics.compareWithPreviousMonth(transactions);
        const budgetUtil = Analytics.getBudgetUtilization(monthTransactions, budgets);

        // Check for overspending categories
        Object.entries(budgetUtil).forEach(([category, data]) => {
            if (data.percentage > 100) {
                const overspent = data.spent - data.budget;
                recommendations.push({
                    type: 'warning',
                    category: category,
                    title: `Over Budget on ${this.getCategoryName(category)}`,
                    message: `You've exceeded your ${this.getCategoryName(category)} budget by $${overspent.toFixed(2)} (${(data.percentage - 100).toFixed(0)}% over).`,
                    savings: overspent
                });
            } else if (data.percentage > 80) {
                const remaining = data.remaining;
                recommendations.push({
                    type: 'caution',
                    category: category,
                    title: `Approaching Limit: ${this.getCategoryName(category)}`,
                    message: `You have $${remaining.toFixed(2)} left in your ${this.getCategoryName(category)} budget this month.`,
                    savings: 0
                });
            }
        });

        // Compare with last month
        if (comparison.percentageChange > 20) {
            recommendations.push({
                type: 'alert',
                category: 'overall',
                title: 'Spending Increased Significantly',
                message: `Your spending is ${comparison.percentageChange.toFixed(0)}% higher than last month ($${comparison.difference.toFixed(2)} more).`,
                savings: comparison.difference
            });
        }

        // Check for high spending in specific categories
        const topCategories = Analytics.getTopCategories(monthTransactions, 3);
        topCategories.forEach((cat, index) => {
            if (index === 0 && cat.amount > 500) {
                recommendations.push({
                    type: 'tip',
                    category: cat.category,
                    title: `Top Spending: ${this.getCategoryName(cat.category)}`,
                    message: `${this.getCategoryName(cat.category)} is your biggest expense at $${cat.amount.toFixed(2)}. ${this.getCategorySavingsTip(cat.category)}`,
                    savings: cat.amount * 0.1 // Potential 10% savings
                });
            }
        });

        // Predict end-of-month overspending
        const prediction = Analytics.predictMonthEndSpending(monthTransactions);
        const totalBudget = Object.values(budgets).reduce((sum, b) => sum + b, 0);
        if (totalBudget > 0 && prediction.predicted > totalBudget) {
            const overspend = prediction.predicted - totalBudget;
            recommendations.push({
                type: 'warning',
                category: 'overall',
                title: 'Projected to Exceed Total Budget',
                message: `Based on current spending, you may exceed your total budget by $${overspend.toFixed(2)} by month end.`,
                savings: overspend
            });
        }

        // Savings goal progress
        if (budgets.savings > 0) {
            const saved = Analytics.getBalance(monthTransactions);
            const progress = (saved / budgets.savings) * 100;
            if (progress < 50) {
                recommendations.push({
                    type: 'goal',
                    category: 'savings',
                    title: 'Savings Goal Progress',
                    message: `You're at ${progress.toFixed(0)}% of your $${budgets.savings} savings goal. Consider reducing discretionary spending.`,
                    savings: budgets.savings - saved
                });
            }
        }

        // If no issues, provide positive feedback
        if (recommendations.length === 0) {
            recommendations.push({
                type: 'success',
                category: 'overall',
                title: 'Great Job! 🎉',
                message: 'You\'re staying within your budgets and managing your finances well. Keep it up!',
                savings: 0
            });
        }

        return recommendations.slice(0, 5); // Return top 5 recommendations
    },

    // Get category-specific savings tips
    getCategorySavingsTip(category) {
        const tips = {
            food: 'Try meal planning and cooking at home more often to save 20-30%.',
            transport: 'Consider carpooling, public transit, or biking to reduce costs.',
            shopping: 'Use the 24-hour rule: wait a day before making non-essential purchases.',
            bills: 'Review subscriptions and negotiate better rates with providers.',
            entertainment: 'Look for free or low-cost activities and use streaming services wisely.',
            health: 'Use generic medications and preventive care to reduce long-term costs.',
            education: 'Explore free online courses and library resources.',
            other: 'Track and categorize these expenses to identify patterns.'
        };
        return tips[category] || 'Review this category for potential savings opportunities.';
    },

    // Get category display name
    getCategoryName(category) {
        const names = {
            food: 'Food & Dining',
            transport: 'Transportation',
            shopping: 'Shopping',
            bills: 'Bills & Utilities',
            entertainment: 'Entertainment',
            health: 'Healthcare',
            education: 'Education',
            other: 'Other',
            overall: 'Overall Spending',
            savings: 'Savings'
        };
        return names[category] || category;
    },

    // Calculate total potential savings
    getTotalPotentialSavings(recommendations) {
        return recommendations.reduce((sum, rec) => sum + (rec.savings || 0), 0);
    }
};
