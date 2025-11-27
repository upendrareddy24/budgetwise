/**
 * Main App Controller
 */

class BudgetApp {
    constructor() {
        this.transactions = [];
        this.budgets = {};
        this.settings = {};
        this.currentFilter = {
            period: 'month',
            category: 'all'
        };

        this.init();
    }

    init() {
        // Load data from storage
        this.loadData();

        // Set up event listeners
        this.setupEventListeners();

        // Initialize UI
        this.updateDashboard();
        this.renderTransactions();
        this.updateCharts();
        this.updateSavingsRecommendations();
        this.updateBudgetOverview();

        // Apply dark mode if enabled
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        }

        // Set today's date as default
        document.getElementById('transactionDate').valueAsDate = new Date();
    }

    loadData() {
        this.transactions = Storage.getTransactions();
        this.budgets = Storage.getBudgets();
        this.settings = Storage.getSettings();
    }

    setupEventListeners() {
        // Transaction form
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        // Filter controls
        document.getElementById('filterPeriod').addEventListener('change', (e) => {
            this.currentFilter.period = e.target.value;
            this.renderTransactions();
        });

        document.getElementById('filterCategory').addEventListener('change', (e) => {
            this.currentFilter.category = e.target.value;
            this.renderTransactions();
        });

        // Budget modal
        document.getElementById('setBudgetBtn').addEventListener('click', () => {
            this.openBudgetModal();
        });

        document.getElementById('closeBudgetModal').addEventListener('click', () => {
            this.closeBudgetModal();
        });

        document.getElementById('budgetForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBudgets();
        });

        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Export data
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        // Close modal on outside click
        document.getElementById('budgetModal').addEventListener('click', (e) => {
            if (e.target.id === 'budgetModal') {
                this.closeBudgetModal();
            }
        });
    }

    addTransaction() {
        const type = document.getElementById('transactionType').value;
        const amount = parseFloat(document.getElementById('transactionAmount').value);
        const category = document.getElementById('transactionCategory').value;
        const description = document.getElementById('transactionDescription').value;
        const date = document.getElementById('transactionDate').value;

        const transaction = {
            type,
            amount,
            category,
            description,
            date
        };

        Storage.addTransaction(transaction);
        this.loadData();
        this.updateUI();

        // Reset form
        document.getElementById('transactionForm').reset();
        document.getElementById('transactionDate').valueAsDate = new Date();

        // Show success animation
        this.showNotification('Transaction added successfully!', 'success');
    }

    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            Storage.deleteTransaction(id);
            this.loadData();
            this.updateUI();
            this.showNotification('Transaction deleted', 'info');
        }
    }

    updateUI() {
        this.updateDashboard();
        this.renderTransactions();
        this.updateCharts();
        this.updateSavingsRecommendations();
        this.updateBudgetOverview();
    }

    updateDashboard() {
        const allTransactions = this.transactions;
        const monthTransactions = Analytics.getTransactionsByPeriod(allTransactions, 'month');

        // Current balance
        const balance = Analytics.getBalance(allTransactions);
        document.getElementById('currentBalance').textContent = this.formatCurrency(balance);

        // Monthly income
        const monthlyIncome = Analytics.getTotalIncome(monthTransactions);
        document.getElementById('monthlyIncome').textContent = this.formatCurrency(monthlyIncome);

        // Monthly expenses
        const monthlyExpenses = Analytics.getTotalExpenses(monthTransactions);
        document.getElementById('monthlyExpenses').textContent = this.formatCurrency(monthlyExpenses);

        // Balance change
        const comparison = Analytics.compareWithPreviousMonth(allTransactions);
        const changeElement = document.getElementById('balanceChange');
        const changeAmount = monthlyIncome - monthlyExpenses;
        changeElement.textContent = `${changeAmount >= 0 ? '+' : ''}${this.formatCurrency(changeAmount)} this month`;
        changeElement.style.color = changeAmount >= 0 ? 'var(--success)' : 'var(--danger)';

        // Savings progress
        if (this.budgets.savings > 0) {
            const saved = balance;
            const progress = Math.min((saved / this.budgets.savings) * 100, 100);
            document.getElementById('savingsProgress').textContent = `${progress.toFixed(0)}%`;
            document.getElementById('savingsBar').style.width = `${progress}%`;
        } else {
            document.getElementById('savingsProgress').textContent = 'Set Goal';
            document.getElementById('savingsBar').style.width = '0%';
        }
    }

    renderTransactions() {
        const container = document.getElementById('transactionsList');
        let filteredTransactions = this.transactions;

        // Apply period filter
        if (this.currentFilter.period !== 'all') {
            filteredTransactions = Analytics.getTransactionsByPeriod(filteredTransactions, this.currentFilter.period);
        }

        // Apply category filter
        if (this.currentFilter.category !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.category === this.currentFilter.category);
        }

        if (filteredTransactions.length === 0) {
            container.innerHTML = '<p class="empty-state">No transactions found for the selected filters.</p>';
            return;
        }

        container.innerHTML = filteredTransactions.map(t => `
            <div class="transaction-item fade-in">
                <div class="transaction-info">
                    <div class="transaction-icon" style="background: ${this.getCategoryColor(t.category)}20; color: ${this.getCategoryColor(t.category)}">
                        ${this.getCategoryIcon(t.category)}
                    </div>
                    <div class="transaction-details">
                        <h4>${t.description || this.getCategoryLabel(t.category)}</h4>
                        <p>${this.getCategoryLabel(t.category)} • ${this.formatDate(t.date)}</p>
                    </div>
                </div>
                <div class="transaction-amount ${t.type}">
                    <div class="amount">${t.type === 'income' ? '+' : '-'}${this.formatCurrency(t.amount)}</div>
                    <div class="transaction-actions">
                        <button class="btn-delete" onclick="app.deleteTransaction('${t.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateCharts() {
        const monthTransactions = Analytics.getTransactionsByPeriod(this.transactions, 'month');
        Charts.updateCharts(monthTransactions);
    }

    updateSavingsRecommendations() {
        const container = document.getElementById('savingsTips');
        const monthTransactions = Analytics.getTransactionsByPeriod(this.transactions, 'month');
        const recommendations = Savings.generateRecommendations(monthTransactions, this.budgets);

        if (recommendations.length === 0) {
            container.innerHTML = '<p class="tip-placeholder">Great job! No recommendations at this time.</p>';
            return;
        }

        container.innerHTML = recommendations.map(rec => `
            <div class="tip-item fade-in">
                <h4>${rec.title}</h4>
                <p>${rec.message}</p>
            </div>
        `).join('');
    }

    updateBudgetOverview() {
        const container = document.getElementById('budgetOverview');
        const monthTransactions = Analytics.getTransactionsByPeriod(this.transactions, 'month');
        const budgetUtil = Analytics.getBudgetUtilization(monthTransactions, this.budgets);

        const entries = Object.entries(budgetUtil);
        if (entries.length === 0) {
            container.innerHTML = '<p class="empty-state">Set your monthly budgets to track spending limits.</p>';
            return;
        }

        container.innerHTML = entries.map(([category, data]) => `
            <div class="budget-item fade-in">
                <div class="budget-header">
                    <span class="budget-label">${this.getCategoryLabel(category)}</span>
                    <span class="budget-values">$${data.spent.toFixed(0)} / $${data.budget.toFixed(0)}</span>
                </div>
                <div class="budget-bar">
                    <div class="budget-fill ${data.percentage > 100 ? 'warning' : ''}" style="width: ${Math.min(data.percentage, 100)}%"></div>
                </div>
            </div>
        `).join('');
    }

    openBudgetModal() {
        // Load current budgets into form
        Object.keys(this.budgets).forEach(category => {
            const input = document.getElementById(`budget-${category}`);
            if (input) {
                input.value = this.budgets[category] || '';
            }
        });

        document.getElementById('budgetModal').classList.add('active');
    }

    closeBudgetModal() {
        document.getElementById('budgetModal').classList.remove('active');
    }

    saveBudgets() {
        const budgets = {
            food: parseFloat(document.getElementById('budget-food').value) || 0,
            transport: parseFloat(document.getElementById('budget-transport').value) || 0,
            shopping: parseFloat(document.getElementById('budget-shopping').value) || 0,
            bills: parseFloat(document.getElementById('budget-bills').value) || 0,
            entertainment: parseFloat(document.getElementById('budget-entertainment').value) || 0,
            health: parseFloat(document.getElementById('budget-health').value) || 0,
            savings: parseFloat(document.getElementById('budget-savings').value) || 0
        };

        Storage.saveBudgets(budgets);
        this.loadData();
        this.updateUI();
        this.closeBudgetModal();
        this.showNotification('Budgets saved successfully!', 'success');
    }

    toggleDarkMode() {
        this.settings.darkMode = !this.settings.darkMode;
        Storage.saveSettings(this.settings);
        document.body.classList.toggle('dark-mode');

        const icon = document.querySelector('#darkModeToggle i');
        icon.className = this.settings.darkMode ? 'fas fa-sun' : 'fas fa-moon';
    }

    exportData() {
        const data = Storage.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budgetwise-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('Data exported successfully!', 'success');
    }

    // Helper methods
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    getCategoryLabel(category) {
        const labels = {
            food: '🍔 Food & Dining',
            transport: '🚗 Transportation',
            shopping: '🛍️ Shopping',
            bills: '💡 Bills & Utilities',
            entertainment: '🎬 Entertainment',
            health: '🏥 Healthcare',
            education: '📚 Education',
            other: '📦 Other',
            salary: '💼 Salary',
            freelance: '💻 Freelance',
            investment: '📈 Investment',
            gift: '🎁 Gift'
        };
        return labels[category] || category;
    }

    getCategoryIcon(category) {
        const icons = {
            food: '🍔',
            transport: '🚗',
            shopping: '🛍️',
            bills: '💡',
            entertainment: '🎬',
            health: '🏥',
            education: '📚',
            other: '📦',
            salary: '💼',
            freelance: '💻',
            investment: '📈',
            gift: '🎁'
        };
        return icons[category] || '📦';
    }

    getCategoryColor(category) {
        const colors = {
            food: '#ef4444',
            transport: '#f59e0b',
            shopping: '#8b5cf6',
            bills: '#3b82f6',
            entertainment: '#ec4899',
            health: '#10b981',
            education: '#6366f1',
            other: '#64748b',
            salary: '#10b981',
            freelance: '#6366f1',
            investment: '#8b5cf6',
            gift: '#ec4899'
        };
        return colors[category] || '#64748b';
    }

    showNotification(message, type = 'info') {
        // Simple notification (you can enhance this with a toast library)
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BudgetApp();
});
