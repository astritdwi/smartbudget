// ==================== UTILITY FUNCTIONS ====================

// Format currency to Indonesian Rupiah
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

// Format date to readable format
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// Get month and year from date
function getMonthYear(dateStr) {
    const date = new Date(dateStr);
    return {
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        monthName: new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(date),
        yearName: date.getFullYear()
    };
}

// Get today's date in YYYY-MM-DD format
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Get first date of current month
function getFirstDayOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Get last date of current month
function getLastDayOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

// Check if date is in current month
function isCurrentMonth(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    return date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
}

// Get number of days passed in current month
function getDaysPassedInMonth() {
    const today = new Date();
    return today.getDate();
}

// Get number of days in current month
function getDaysInMonth() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
}

// Get remaining days in month
function getRemainingDaysInMonth() {
    return getDaysInMonth() - getDaysPassedInMonth();
}

// Calculate percentage
function getPercentage(value, total) {
    return total === 0 ? 0 : Math.round((value / total) * 100);
}

// Truncate text
function truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

// Remove duplicates from array
function removeDuplicates(arr) {
    return [...new Set(arr)];
}

// Capitalize first letter
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get unique categories from transactions
function getUniqueCategories(transactions) {
    return removeDuplicates(transactions.map(t => t.category)).sort();
}

// Filter transactions by month
function getTransactionsByMonth(transactions, monthOffset = 0) {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    
    return transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === targetDate.getMonth() && 
               tDate.getFullYear() === targetDate.getFullYear();
    });
}

// Get all transactions for current month
function getCurrentMonthTransactions(transactions) {
    return getTransactionsByMonth(transactions, 0);
}

// Calculate sum by type
function calculateByType(transactions, type) {
    return transactions
        .filter(t => t.type === type)
        .reduce((sum, t) => sum + t.amount, 0);
}

// Group transactions by category
function groupByCategory(transactions) {
    return transactions.reduce((grouped, t) => {
        const category = t.category;
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(t);
        return grouped;
    }, {});
}

// Calculate sum by category
function calculateByCategory(transactions) {
    const grouped = groupByCategory(transactions);
    const result = {};
    
    for (const [category, items] of Object.entries(grouped)) {
        result[category] = items.reduce((sum, t) => sum + t.amount, 0);
    }
    
    return result;
}

// Get top categories
function getTopCategories(transactions, limit = 5) {
    const byCategory = calculateByCategory(transactions);
    return Object.entries(byCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .reduce((result, [cat, amount]) => {
            result[cat] = amount;
            return result;
        }, {});
}

// Calculate average daily spending
function getAverageDailySpending(transactions) {
    const currentMonthTransactions = getCurrentMonthTransactions(transactions);
    const expenses = calculateByType(currentMonthTransactions, 'expense');
    const daysPassed = getDaysPassedInMonth();
    
    return daysPassed === 0 ? 0 : Math.round(expenses / daysPassed);
}

// Get spending trend over time
function getSpendingTrend(transactions, days = 30) {
    const trend = {};
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTransactions = transactions.filter(t => 
            t.date === dateStr && t.type === 'expense'
        );
        
        trend[dateStr] = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
    }
    
    return trend;
}

// Save data to localStorage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Get data from localStorage
function getData(key, defaultValue = null) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
}

// Delete data from localStorage
function deleteData(key) {
    localStorage.removeItem(key);
}

// Show toast notification
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Add toast styles to document
function initializeToastStyles() {
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                bottom: -100px;
                right: 20px;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                gap: 0.75rem;
                z-index: 1000;
                transition: bottom 0.3s ease;
                font-weight: 500;
            }
            
            .toast.show {
                bottom: 20px;
            }
            
            .toast-success {
                border-left: 4px solid #10b981;
                color: #10b981;
            }
            
            .toast-error {
                border-left: 4px solid #ef4444;
                color: #ef4444;
            }
            
            .toast-info {
                border-left: 4px solid #6366f1;
                color: #6366f1;
            }
            
            @media (max-width: 480px) {
                .toast {
                    right: 10px;
                    left: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeToastStyles);
