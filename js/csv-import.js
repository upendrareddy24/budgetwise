/**
 * CSV Import Module
 * Handles CSV parsing and transaction conversion
 */

const CSVImport = {
    /**
     * Parse CSV text into headers and rows
     */
    parseCSV(text) {
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
            return { headers: [], rows: [] };
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
            if (row.length === headers.length) {
                rows.push(row);
            }
        }

        return { headers, rows };
    },

    /**
     * Detect column indices for date, amount, description
     */
    detectColumns(headers) {
        const mapping = {
            date: -1,
            amount: -1,
            description: -1,
            category: -1
        };

        headers.forEach((header, index) => {
            const h = header.toLowerCase();

            // Date detection
            if (h.includes('date') || h.includes('transaction date') || h.includes('posting date')) {
                mapping.date = index;
            }

            // Amount detection
            if (h.includes('amount') || h.includes('debit') || h.includes('withdrawal')) {
                mapping.amount = index;
            }

            // Description detection
            if (h.includes('description') || h.includes('merchant') || h.includes('payee')) {
                mapping.description = index;
            }

            // Category detection
            if (h.includes('category') || h.includes('type')) {
                mapping.category = index;
            }
        });

        return mapping;
    },

    /**
     * Convert CSV row to transaction object
     */
    rowToTransaction(row, mapping) {
        if (mapping.date === -1 || mapping.amount === -1) {
            return null;
        }

        const dateStr = row[mapping.date];
        const amountStr = row[mapping.amount];

        if (!dateStr || !amountStr) return null;

        // Parse amount
        const amount = parseFloat(amountStr.replace(/[$,]/g, ''));
        if (isNaN(amount) || amount === 0) return null;

        // Parse date
        const date = this.parseDate(dateStr);
        if (!date) return null;

        // Get description
        const description = mapping.description !== -1
            ? row[mapping.description]
            : 'Transaction';

        // Get or auto-detect category
        let category = 'other';
        if (mapping.category !== -1 && row[mapping.category]) {
            category = row[mapping.category].toLowerCase();
        } else {
            category = this.autoCategorize(description);
        }

        return {
            type: amount < 0 ? 'expense' : 'income',
            amount: Math.abs(amount),
            category: category,
            description: description,
            date: date
        };
    },

    /**
     * Parse various date formats
     */
    parseDate(dateStr) {
        // Try MM/DD/YYYY or MM/DD/YY
        let match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
        if (match) {
            let year = parseInt(match[3]);
            if (year < 100) year += year < 50 ? 2000 : 1900;
            const month = match[1].padStart(2, '0');
            const day = match[2].padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        // Try YYYY-MM-DD
        match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            return dateStr;
        }

        return null;
    },

    /**
     * Auto-categorize based on description
     */
    autoCategorize(description) {
        const desc = description.toLowerCase();

        if (/restaurant|cafe|coffee|food|dining|starbucks|mcdonald/i.test(desc)) return 'food';
        if (/gas|fuel|uber|lyft|taxi|parking/i.test(desc)) return 'transport';
        if (/amazon|walmart|target|store|shop/i.test(desc)) return 'shopping';
        if (/electric|water|internet|phone|utility|bill/i.test(desc)) return 'bills';
        if (/netflix|spotify|movie|entertainment/i.test(desc)) return 'entertainment';
        if (/pharmacy|doctor|hospital|medical|health/i.test(desc)) return 'health';

        return 'other';
    }
};
