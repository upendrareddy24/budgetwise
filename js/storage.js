/**
 * Storage Module - Handles all data persistence using localStorage
 */

const Storage = {
    // Keys for localStorage
    KEYS: {
        TRANSACTIONS: 'budgetwise_transactions',
        BUDGETS: 'budgetwise_budgets',
        SETTINGS: 'budgetwise_settings'
    },

    // Get all transactions
    getTransactions() {
        const data = localStorage.getItem(this.KEYS.TRANSACTIONS);
        return data ? JSON.parse(data) : [];
    },

    // Save transactions
    saveTransactions(transactions) {
        localStorage.setItem(this.KEYS.TRANSACTIONS, JSON.stringify(transactions));
    },

    // Add a new transaction
    addTransaction(transaction) {
        const transactions = this.getTransactions();
        const newTransaction = {
            id: Date.now().toString(),
            ...transaction,
            createdAt: new Date().toISOString()
        };
        transactions.unshift(newTransaction);
        this.saveTransactions(transactions);
        return newTransaction;
    },

    // Delete a transaction
    deleteTransaction(id) {
        const transactions = this.getTransactions();
        const filtered = transactions.filter(t => t.id !== id);
        this.saveTransactions(filtered);
    },

    // Get budgets
    getBudgets() {
        const data = localStorage.getItem(this.KEYS.BUDGETS);
        return data ? JSON.parse(data) : {
            food: 0,
            transport: 0,
            shopping: 0,
            bills: 0,
            entertainment: 0,
            health: 0,
            savings: 0
        };
    },

    // Save budgets
    saveBudgets(budgets) {
        localStorage.setItem(this.KEYS.BUDGETS, JSON.stringify(budgets));
    },

    // Get settings
    getSettings() {
        const data = localStorage.getItem(this.KEYS.SETTINGS);
        return data ? JSON.parse(data) : {
            darkMode: false,
            currency: 'USD'
        };
    },

    // Save settings
    saveSettings(settings) {
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    },

    // Export all data
    exportData() {
        return {
            transactions: this.getTransactions(),
            budgets: this.getBudgets(),
            settings: this.getSettings(),
            exportedAt: new Date().toISOString()
        };
    },

    // Import data
    importData(data) {
        if (data.transactions) this.saveTransactions(data.transactions);
        if (data.budgets) this.saveBudgets(data.budgets);
        if (data.settings) this.saveSettings(data.settings);
    },

    // Clear all data
    clearAll() {
        localStorage.removeItem(this.KEYS.TRANSACTIONS);
        localStorage.removeItem(this.KEYS.BUDGETS);
        localStorage.removeItem(this.KEYS.SETTINGS);
    }
};
