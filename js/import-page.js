// Import Page - Handles PDF and CSV file uploads
let allTransactions = [];

document.addEventListener('DOMContentLoaded', () => {
    // Set PDF.js worker
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const cancelBtn = document.getElementById('cancelBtn');
    const importBtn = document.getElementById('importBtn');
    const importMoreBtn = document.getElementById('importMoreBtn');

    // Upload area click
    uploadArea.addEventListener('click', () => fileInput.click());

    // File selection
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            processFiles(Array.from(e.target.files));
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--border-color)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border-color)';
        if (e.dataTransfer.files.length > 0) {
            processFiles(Array.from(e.dataTransfer.files));
        }
    });

    // Buttons
    cancelBtn.addEventListener('click', reset);
    importBtn.addEventListener('click', confirmImport);
    importMoreBtn.addEventListener('click', reset);
});

async function processFiles(files) {
    showLoading();
    allTransactions = [];

    for (const file of files) {
        try {
            if (file.name.toLowerCase().endsWith('.pdf')) {
                await processPDF(file);
            } else if (file.name.toLowerCase().endsWith('.csv')) {
                await processCSV(file);
            }
        } catch (error) {
            console.error(`Error processing ${file.name}:`, error);
        }
    }

    if (allTransactions.length === 0) {
        showError('No transactions found. Please check your files.');
    } else {

        if (result.rows.length === 0) return;

        const mapping = CSVImport.detectColumns(result.headers);
        if (mapping.date === -1 || mapping.amount === -1) return;

        for (const row of result.rows) {
            const transaction = CSVImport.rowToTransaction(row, mapping);
            if (transaction) {
                allTransactions.push(transaction);
            }
        }
    }

    function categorize(desc) {
        const d = desc.toLowerCase();
        if (/restaurant|cafe|coffee|food|dining/i.test(d)) return 'food';
        if (/gas|fuel|uber|lyft|taxi/i.test(d)) return 'transport';
        if (/amazon|walmart|target|shop/i.test(d)) return 'shopping';
        if (/electric|water|internet|phone|bill/i.test(d)) return 'bills';
        if (/netflix|spotify|movie/i.test(d)) return 'entertainment';
        if (/pharmacy|doctor|hospital|health/i.test(d)) return 'health';
        return 'other';
    }

    function formatDate(dateStr) {
        const parts = dateStr.split('/');
        let year = parseInt(parts[2]);
        if (year < 100) year += year < 50 ? 2000 : 1900;
        return `${year}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }

    function showPreview() {
        document.getElementById('importCount').textContent = allTransactions.length;

        const html = `
        <div style="max-height: 400px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead style="position: sticky; top: 0; background: var(--bg-card);">
                    <tr style="border-bottom: 2px solid var(--border-color);">
                        <th style="padding: 0.75rem; text-align: left;">Date</th>
                        <th style="padding: 0.75rem; text-align: left;">Description</th>
                        <th style="padding: 0.75rem; text-align: left;">Category</th>
                        <th style="padding: 0.75rem; text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${allTransactions.map(t => `
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 0.75rem;">${new Date(t.date).toLocaleDateString()}</td>
                            <td style="padding: 0.75rem;">${t.description}</td>
                            <td style="padding: 0.75rem;">${getCategoryIcon(t.category)}</td>
                            <td style="padding: 0.75rem; text-align: right; color: var(--danger);">-$${t.amount.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

        document.getElementById('previewContent').innerHTML = html;
        document.getElementById('previewCard').style.display = 'block';
        document.getElementById('resultCard').style.display = 'none';
    }

    function confirmImport() {
        allTransactions.forEach(t => Storage.addTransaction(t));

        document.getElementById('resultContent').innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-check-circle" style="font-size: 4rem; color: var(--success); margin-bottom: 1rem;"></i>
            <h3>Successfully imported ${allTransactions.length} transactions!</h3>
            <p style="color: var(--text-secondary); margin-top: 0.5rem;">Your transactions are now in BudgetWise</p>
        </div>
    `;

        document.getElementById('previewCard').style.display = 'none';
        document.getElementById('resultCard').style.display = 'block';
    }

    function showLoading() {
        document.getElementById('previewContent').innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: var(--primary);"></i>
            <p style="margin-top: 1rem;">Processing files...</p>
        </div>
    `;
        document.getElementById('previewCard').style.display = 'block';
    }

    function showError(message) {
        document.getElementById('previewContent').innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: var(--danger);"></i>
            <h3 style="margin-top: 1rem;">Error</h3>
            <p style="color: var(--text-secondary); margin-top: 0.5rem;">${message}</p>
        </div>
    `;
        document.getElementById('previewCard').style.display = 'block';
        document.getElementById('importBtn').style.display = 'none';
    }

    function reset() {
        allTransactions = [];
        document.getElementById('fileInput').value = '';
        document.getElementById('previewCard').style.display = 'none';
        document.getElementById('resultCard').style.display = 'none';
        document.getElementById('importBtn').style.display = 'inline-flex';
    }

    function getCategoryIcon(category) {
        const icons = {
            food: '🍔 Food',
            transport: '🚗 Transport',
            shopping: '🛍️ Shopping',
            bills: '💡 Bills',
            entertainment: '🎬 Entertainment',
            health: '🏥 Health',
            other: '📦 Other'
        };
        return icons[category] || category;
    }
