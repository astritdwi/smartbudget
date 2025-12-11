// ==================== SMARTBUDGET MAIN APPLICATION ====================

let transactions = [];
let charts = {};
let goals = [];
let currentTheme = localStorage.getItem('smartbudget_theme') || 'light';
let selectedDate = getTodayDate();

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    checkMonthlyReset();
    loadTransactions();
    loadGoals();
    setDateToToday();
    renderCalendar();
    updateSelectedDateDisplay();
    initializeEventListeners();
    initializeTheme();
    updateDashboard();
    updateHealth();
    initializeCategoryInput();
});

// Return month key like "2025-12"
function getCurrentMonthKey() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

// If user opens app in a new month, ensure UI reflects reset totals for the month.
// This does not delete past transactions; it only updates the stored "last open" month
// and notifies the user so initialBalance + monthly totals will be 0 unless set.
function checkMonthlyReset() {
    // placeholder: monthly reset logic removed along with calendar UI
}

// Utility to retrieve archived data for a month (returns null if missing)
function getArchive(monthKey) {
    return getData('smartbudget_archive_' + monthKey, null);
}

// ==================== PAGE LOAD ====================

// Preload some sample data if empty
if (transactions.length === 0) {
    // Optional: Add sample transactions for demo
    // Uncomment jika ingin menambah data sampel
    /*
    const sampleData = [
        { id: 1, amount: 1000000, description: 'Gaji Bulanan', type: 'income', category: 'Gaji & Pemasukan', date: getTodayDate() },
        { id: 2, amount: 50000, description: 'Beli Kopi', type: 'expense', category: 'Makanan & Minuman', date: getTodayDate() },
        { id: 3, amount: 75000, description: 'Isi Bensin', type: 'expense', category: 'Transportasi', date: getTodayDate() }
    ];
    transactions = sampleData;
    saveTransactions();
    updateDashboard();
    */
}

// Load transactions from localStorage
function loadTransactions() {
    const saved = getData('smartbudget_transactions', []);
    transactions = saved.map(t => ({
        ...t,
        id: t.id || Date.now()
    }));
}

// Save transactions to localStorage
function saveTransactions() {
    saveData('smartbudget_transactions', transactions);
}

// Load initial balance
// (initial balance feature removed)

// Set date input to today
function setDateToToday() {
    const dateInput = document.getElementById('date');
    
    if (dateInput) {
        const today = getTodayDate();
        dateInput.value = today;
        
        // Set min date to first day of current month
        const firstDay = getFirstDayOfMonth();
        const minDate = firstDay.toISOString().split('T')[0];
        dateInput.min = minDate;
        
        // Set max date to last day of current month (allow full month access)
        const lastDay = getLastDayOfMonth();
        const maxDate = lastDay.toISOString().split('T')[0];
        dateInput.max = maxDate;
        
        // Update date display
        updateDateDisplay();
    }
}

// Update date display helper text
function updateDateDisplay() {
    const dateInput = document.getElementById('date');
    const dateDisplay = document.getElementById('dateDisplay');
    
    if (dateInput && dateDisplay && dateInput.value) {
        const date = new Date(dateInput.value);
        const day = date.getDate();
        const month = date.toLocaleString('id-ID', { month: 'short' });
        const year = date.getFullYear();
        
        dateDisplay.textContent = `${day} ${month} '${year.toString().slice(2)}`;
    } else if (dateDisplay) {
        dateDisplay.textContent = '';
    }
}

// ==================== UTILITY HELPERS ====================

// Debounce function to delay execution
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==================== CALENDAR SEARCH ====================

let calendarCurrentDate = new Date();

function renderCalendar() {
    const year = calendarCurrentDate.getFullYear();
    const month = calendarCurrentDate.getMonth();
    
    // Update select dropdowns
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    
    if (monthSelect) monthSelect.value = month;
    if (yearSelect) yearSelect.value = year;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;
    
    calendarGrid.innerHTML = '';
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
    }
    
    // Current month days
    const todayDate = getTodayDate();
    const today = new Date(todayDate).getDate();
    const todayMonth = new Date(todayDate).getMonth();
    const todayYear = new Date(todayDate).getFullYear();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Format the date as YYYY-MM-DD
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Mark today
        if (day === today && month === todayMonth && year === todayYear) {
            dayElement.classList.add('today');
        }
        
        // Mark selected date
        if (dateStr === selectedDate) {
            dayElement.classList.add('selected');
        }
        
        dayElement.addEventListener('click', () => selectDateFromCalendar(dateStr));
        calendarGrid.appendChild(dayElement);
    }
    
    // Next month days
    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
    }
}

function goToPreviousMonth() {
    calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() - 1);
    renderCalendar();
}

function goToNextMonth() {
    calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + 1);
    renderCalendar();
}

function updateCalendarDisplay() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    
    if (monthSelect && yearSelect) {
        const month = parseInt(monthSelect.value);
        const year = parseInt(yearSelect.value);
        calendarCurrentDate = new Date(year, month, 1);
        renderCalendar();
    }
}

function selectDateFromCalendar(dateStr) {
    selectedDate = dateStr;
    renderCalendar();
    updateSelectedDateDisplay();
    updateDashboard();
    closeCalendarModal();
}

function openCalendarModal() {
    const calendarModal = document.getElementById('calendarModal');
    if (calendarModal) {
        calendarModal.classList.add('show');
        renderCalendar();
    }
}

function closeCalendarModal() {
    const calendarModal = document.getElementById('calendarModal');
    if (calendarModal) {
        calendarModal.classList.remove('show');
    }
}

function updateSelectedDateDisplay() {
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    if (selectedDateDisplay) {
        const label = getDateGroupLabel(selectedDate);
        selectedDateDisplay.textContent = label;
    }
}

// Modal functions
// (initial balance modal functions removed)

// ==================== EVENT LISTENERS ====================

function initializeEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', switchTab);
    });

    // Form submission
    const form = document.getElementById('transactionForm');
    if (form) {
        form.addEventListener('submit', handleAddTransaction);
    }

    // Category selection with AI
    const categorySelect = document.getElementById('categorySelect');
    const descriptionInput = document.getElementById('description');
    const aiCategoryBadge = document.getElementById('aiCategoryBadge');
    
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            // Manual selection - clear AI hint
            if (this.value) {
                document.getElementById('aiHint').textContent = '';
            }
        });
    }
    
    if (aiCategoryBadge && descriptionInput) {
        aiCategoryBadge.addEventListener('click', suggestCategoryFromAI);
    }
    
    // Real-time category auto-detection when typing description
    if (descriptionInput && categorySelect) {
        descriptionInput.addEventListener('input', debounce(function() {
            const description = this.value.trim();
            
            // Only auto-suggest if no category selected
            if (description.length > 2 && !categorySelect.value) {
                const result = detectCategory(description);
                // Auto-fill if confidence is high enough
                if (result.confidence > 50) {
                    categorySelect.value = result.category;
                    
                    // Show confidence hint
                    const aiHint = document.getElementById('aiHint');
                    if (result.confidence > 70) {
                        aiHint.textContent = `💡 Kategori auto-terdeteksi: ${result.category}`;
                        aiHint.style.color = '#10b981';
                    } else if (result.confidence > 50) {
                        aiHint.textContent = `🤔 Kemungkinan kategori: ${result.category}`;
                        aiHint.style.color = '#f59e0b';
                    }
                }
            } else if (description.length <= 2) {
                document.getElementById('aiHint').textContent = '';
            }
        }, 300));
    }
    
    // Date input initialization
    const dateInput = document.getElementById('date');
    
    if (dateInput) {
        // Update display when date changes
        dateInput.addEventListener('change', function() {
            updateDateDisplay();
        });
    }
    
    // Initialize date display
    updateDateDisplay();

    // Filters
    const filterSearch = document.getElementById('filterSearch');
    const filterCategory = document.getElementById('filterCategory');
    
    if (filterSearch) {
        filterSearch.addEventListener('input', renderTransactions);
    }
    
    if (filterCategory) {
        filterCategory.addEventListener('change', renderTransactions);
    }
    
    // Calendar search
    const openCalendarBtn = document.getElementById('openCalendarBtn');
    const closeCalendarBtn = document.getElementById('closeCalendarBtn');
    const calendarModal = document.getElementById('calendarModal');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    
    if (openCalendarBtn) {
        openCalendarBtn.addEventListener('click', openCalendarModal);
    }
    if (closeCalendarBtn) {
        closeCalendarBtn.addEventListener('click', closeCalendarModal);
    }
    if (calendarModal) {
        calendarModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeCalendarModal();
            }
        });
    }
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', goToPreviousMonth);
    }
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', goToNextMonth);
    }
    if (monthSelect) {
        monthSelect.addEventListener('change', updateCalendarDisplay);
    }
    if (yearSelect) {
        yearSelect.addEventListener('change', updateCalendarDisplay);
    }
    
    // (initial balance modal removed)

    // Goals form
    const goalsForm = document.getElementById('goalsForm');
    if (goalsForm) {
        goalsForm.addEventListener('submit', handleAddGoal);
    }

    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setTheme(this.dataset.theme);
        });
    });

    // Compact calendar month/year selects (if present)
    const monthSel = document.getElementById('dashboardMonthSelect');
    const yearSel = document.getElementById('dashboardYearSelect');
    if (monthSel) {
        monthSel.addEventListener('change', function() {
            const m = this.value.padStart ? this.value.padStart(2,'0') : String(this.value).padStart(2,'0');
            const y = yearSel ? yearSel.value : selectedDate.substring(0,4);
            setDashboardDate(`${y}-${m}-01`);
            renderDayPicker();
        });
    }
    if (yearSel) {
        yearSel.addEventListener('change', function() {
            const y = this.value;
            const m = monthSel ? monthSel.value.padStart(2,'0') : selectedDate.substring(5,7);
            setDashboardDate(`${y}-${m}-01`);
            renderDayPicker();
        });
    }

    // Settings modal close button
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', closeSettingsModal);
    }


}

// Suggest category from AI based on description
function suggestCategoryFromAI() {
    const description = document.getElementById('description').value.trim();
    const categorySelect = document.getElementById('categorySelect');
    const aiHint = document.getElementById('aiHint');
    
    if (!description || description.length < 2) {
        showToast('Ketik deskripsi terlebih dahulu untuk saran AI', 'info');
        return;
    }
    
    const result = detectCategory(description);
    categorySelect.value = result.category;
    
    // Show hint
    if (result.confidence > 70) {
        aiHint.textContent = `✨ AI menyarankan: ${result.category} (${Math.round(result.confidence)}% yakin)`;
        aiHint.style.color = '#10b981';
    } else if (result.confidence > 40) {
        aiHint.textContent = `🤔 Kemungkinan: ${result.category} atau ${result.alternatives[0]?.category}`;
        aiHint.style.color = '#f59e0b';
    } else {
        aiHint.textContent = `🤷 Sulit dideteksi. Silakan pilih kategori secara manual.`;
        aiHint.style.color = '#6366f1';
    }
}

// Switch between tabs
function switchTab(e) {
    const tabName = e.target.dataset.tab;
    
    // Update active button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');

    // Update active content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    // Update content when switching to analytics or predictions
    if (tabName === 'analytics') {
        setTimeout(updateAnalytics, 100);
    } else if (tabName === 'predictions') {
        setTimeout(updatePredictions, 100);
    }
}

// ==================== TRANSACTION OPERATIONS ====================

function handleAddTransaction(e) {
    e.preventDefault();

    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('description');
    const typeSelect = document.getElementById('type');
    const categorySelect = document.getElementById('categorySelect');
    const dateInput = document.getElementById('date');

    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value.trim();
    const type = typeSelect.value;
    const category = categorySelect.value.trim();
    const date = dateInput.value;

    // Validation
    if (!amount || amount <= 0) {
        showToast('❌ Jumlah harus lebih dari 0', 'error');
        amountInput.focus();
        return;
    }

    if (!description || description.length < 2) {
        showToast('❌ Deskripsi minimal 2 karakter', 'error');
        descriptionInput.focus();
        return;
    }

    if (!type) {
        showToast('❌ Pilih tipe transaksi (Pemasukan/Pengeluaran)', 'error');
        typeSelect.focus();
        return;
    }

    if (!category) {
        showToast('❌ Pilih kategori transaksi', 'error');
        categorySelect.focus();
        return;
    }

    if (!date) {
        showToast('❌ Pilih tanggal transaksi', 'error');
        dateInput.focus();
        return;
    }

    // Add transaction
    const transaction = {
        id: Date.now(),
        amount,
        description,
        type,
        category,
        date,
        createdAt: new Date().toISOString()
    };

    transactions.push(transaction);
    saveTransactions();

    // Clear form
    e.target.reset();
    setDateToToday();
    document.getElementById('aiHint').textContent = '';
    
    // Reset select dropdowns
    typeSelect.value = '';
    categorySelect.value = '';

    // Update UI
    updateDashboard();
    showToast(`✅ Transaksi "${description}" berhasil ditambahkan!`, 'success');
    
    // Focus back to first field
    amountInput.focus();
}

function deleteTransaction(id) {
    if (confirm('Hapus transaksi ini?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        updateDashboard();
        showToast('Transaksi berhasil dihapus', 'success');
    }
}

// ==================== DASHBOARD UPDATES ====================

function updateDashboard() {
    updateBalanceForDate(selectedDate);
    updateDayDetails(selectedDate);
    renderTransactions();
    renderGoals();
    updateRecommendations();
}

function updateBalanceForDate(dateStr) {
    // Get all transactions for the current month (displayed in dashboard)
    const dt = new Date(dateStr);

    // Transactions in same month
    const monthTx = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === dt.getFullYear() && d.getMonth() === dt.getMonth();
    });

    // Calculate total income and expense for the entire month
    const totalMonthIncome = monthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalMonthExpense = monthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate ending balance (total income - total expense)
    const endingBalance = totalMonthIncome - totalMonthExpense;

    // Update DOM with monthly totals
    const incomeEl = document.getElementById('totalIncome');
    const expenseEl = document.getElementById('totalExpense');
    const balanceEl = document.getElementById('totalBalance');

    if (incomeEl) incomeEl.textContent = formatCurrency(totalMonthIncome);
    if (expenseEl) expenseEl.textContent = formatCurrency(totalMonthExpense);
    if (balanceEl) balanceEl.textContent = formatCurrency(endingBalance);

    // Update category filter (still based on current month)
    updateCategoryFilter();

    // Update dashboard date picker UI and nav buttons state
    updateDashboardDateUI(dateStr);
}

function updateCategoryFilter() {
    const currentMonthTransactions = getCurrentMonthTransactions(transactions);
    const categories = getUniqueCategories(currentMonthTransactions);
    
    const filterSelect = document.getElementById('filterCategory');
    const currentValue = filterSelect.value;

    // Clear and rebuild options
    filterSelect.innerHTML = '<option value="">Semua Kategori</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        filterSelect.appendChild(option);
    });

    filterSelect.value = currentValue;
}

function getDateGroupLabel(dateStr) {
    // Return label for date grouping: "Hari Ini", "Kemarin", or formatted date
    const txDate = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Compare dates (ignoring time)
    const txDateOnly = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (txDateOnly.getTime() === todayOnly.getTime()) {
        return 'Hari Ini';
    } else if (txDateOnly.getTime() === yesterdayOnly.getTime()) {
        return 'Kemarin';
    } else {
        return formatDate(dateStr);
    }
}

function renderTransactions() {
    let currentMonthTransactions = getCurrentMonthTransactions(transactions);
    
    // Apply filters
    const searchQuery = document.getElementById('filterSearch').value.toLowerCase();
    const selectedCategory = document.getElementById('filterCategory').value;

    if (searchQuery) {
        currentMonthTransactions = currentMonthTransactions.filter(t =>
            t.description.toLowerCase().includes(searchQuery) ||
            t.category.toLowerCase().includes(searchQuery)
        );
    }

    if (selectedCategory) {
        currentMonthTransactions = currentMonthTransactions.filter(t =>
            t.category === selectedCategory
        );
    }

    // Sort by date descending
    currentMonthTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    const container = document.getElementById('transactionsList');

    if (currentMonthTransactions.length === 0) {
        container.innerHTML = '<p class="empty-state">Belum ada transaksi</p>';
        return;
    }

    // Group transactions by date
    const grouped = {};
    const dateOrder = [];

    currentMonthTransactions.forEach(tx => {
        if (!grouped[tx.date]) {
            grouped[tx.date] = [];
            dateOrder.push(tx.date);
        }
        grouped[tx.date].push(tx);
    });

    // Build HTML with date group headers
    let html = '';
    dateOrder.forEach(date => {
        const txList = grouped[date];
        const dateLabel = getDateGroupLabel(date);

        html += `<div class="transaction-date-group">
            <div class="transaction-date-header">${dateLabel}</div>
            <div class="transaction-date-items">`;

        txList.forEach(transaction => {
            html += `
                <div class="transaction-item ${transaction.type}">
                    <div class="transaction-left">
                        <div class="transaction-icon">
                            <i class="fas fa-${transaction.type === 'income' ? 'arrow-down' : 'arrow-up'}"></i>
                        </div>
                        <div class="transaction-details">
                            <h4>${transaction.description}</h4>
                            <p>${transaction.category}</p>
                        </div>
                    </div>
                    <div class="transaction-right">
                        <div class="transaction-amount ${transaction.type}">
                            ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}
                        </div>
                        <button class="transaction-edit" onclick="editTransaction(${transaction.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="transaction-delete" onclick="deleteTransaction(${transaction.id})" title="Hapus">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>`;
        });

        html += `</div></div>`;
    });

    container.innerHTML = html;
}

function updateRecommendations() {
    const recommendations = generateRecommendations(transactions);
    const container = document.getElementById('recommendationsList');

    if (recommendations.length === 0) {
        container.innerHTML = '<p class="empty-state">Mulai tambahkan transaksi untuk mendapat rekomendasi cerdas...</p>';
        return;
    }

    container.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item ${rec.type}">
            <div class="recommendation-header">
                <i class="${rec.icon}"></i>
                <span class="recommendation-title">${rec.title}</span>
            </div>
            <p class="recommendation-desc">${rec.description}</p>
        </div>
    `).join('');
}

// ==================== ANALYTICS ====================

function updateAnalytics() {
    const currentMonthTransactions = getCurrentMonthTransactions(transactions);
    const expenses = currentMonthTransactions.filter(t => t.type === 'expense');
    const income = currentMonthTransactions.filter(t => t.type === 'income');

    if (expenses.length === 0 && income.length === 0) {
        document.getElementById('categoryChart').parentElement.innerHTML = 
            '<p class="empty-state">Tidak ada data untuk dianalisis</p>';
        return;
    }

    // Category chart for expenses
    if (expenses.length > 0) {
        updateCategoryChart(expenses);
    } else {
        document.getElementById('categoryChart').parentElement.innerHTML = 
            '<p class="empty-state">Tidak ada data pengeluaran</p>';
    }

    // Income chart
    if (income.length > 0) {
        updateIncomeChart(income);
    } else {
        document.getElementById('incomeChart').parentElement.innerHTML = 
            '<p class="empty-state">Tidak ada data pemasukan</p>';
    }

    // Trend chart
    updateTrendChart(expenses);

    // Ranking lists
    if (expenses.length > 0) {
        updateExpenseRanking(expenses);
    } else {
        document.getElementById('expenseRanking').innerHTML = 
            '<p class="empty-state">Tidak ada data pengeluaran</p>';
    }

    if (income.length > 0) {
        updateIncomeRanking(income);
    } else {
        document.getElementById('incomeRanking').innerHTML = 
            '<p class="empty-state">Tidak ada data pemasukan</p>';
    }

    // Statistics
    updateStatistics(currentMonthTransactions, expenses);
}

function updateCategoryChart(expenses) {
    const categoryData = calculateByCategory(expenses);
    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);

    const ctx = document.getElementById('categoryChart');
    
    if (charts.categoryChart) {
        charts.categoryChart.destroy();
    }

    charts.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#6366f1', '#818cf8', '#a78bfa', '#c4b5fd',
                    '#10b981', '#34d399', '#6ee7b7', '#a7f3d0',
                    '#f59e0b', '#fbbf24', '#fcd34d', '#fef08a',
                    '#ef4444', '#f87171', '#fca5a5', '#fecaca'
                ],
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12 },
                        padding: 15,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function updateIncomeChart(income) {
    const categoryData = calculateByCategory(income);
    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);

    const ctx = document.getElementById('incomeChart');
    
    if (charts.incomeChart) {
        charts.incomeChart.destroy();
    }

    charts.incomeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#10b981', '#34d399', '#6ee7b7', '#a7f3d0',
                    '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc',
                    '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe',
                    '#f59e0b', '#fbbf24', '#fcd34d', '#fef08a'
                ],
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12 },
                        padding: 15,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function updateExpenseRanking(expenses) {
    const categoryData = calculateByCategory(expenses);
    const ranked = Object.entries(categoryData)
        .sort((a, b) => b[1] - a[1])
        .map((entry, index) => ({
            position: index + 1,
            category: entry[0],
            amount: entry[1]
        }));

    const container = document.getElementById('expenseRanking');
    
    if (ranked.length === 0) {
        container.innerHTML = '<p class="empty-state">Tidak ada data</p>';
        return;
    }

    container.innerHTML = ranked.map(item => `
        <div class="ranking-item expense">
            <div class="ranking-position">
                <div class="ranking-badge">${item.position}</div>
                <div class="ranking-info">
                    <div class="ranking-category">${item.category}</div>
                    <div class="ranking-amount">
                        Pengeluaran: <span class="ranking-value">${formatCurrency(item.amount)}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function updateIncomeRanking(income) {
    const categoryData = calculateByCategory(income);
    const ranked = Object.entries(categoryData)
        .sort((a, b) => b[1] - a[1])
        .map((entry, index) => ({
            position: index + 1,
            category: entry[0],
            amount: entry[1]
        }));

    const container = document.getElementById('incomeRanking');
    
    if (ranked.length === 0) {
        container.innerHTML = '<p class="empty-state">Tidak ada data</p>';
        return;
    }

    container.innerHTML = ranked.map(item => `
        <div class="ranking-item income">
            <div class="ranking-position">
                <div class="ranking-badge">${item.position}</div>
                <div class="ranking-info">
                    <div class="ranking-category">${item.category}</div>
                    <div class="ranking-amount">
                        Pemasukan: <span class="ranking-value">${formatCurrency(item.amount)}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function updateTrendChart(expenses) {
    const trend = getSpendingTrend(expenses, 30);
    const labels = Object.keys(trend).map(date => {
        const d = new Date(date);
        return d.getDate() + '/' + (d.getMonth() + 1);
    });
    const data = Object.values(trend);

    const ctx = document.getElementById('trendChart');
    
    if (charts.trendChart) {
        charts.trendChart.destroy();
    }

    charts.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pengeluaran Harian',
                data: data,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: { size: 12 },
                        padding: 15
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => formatCurrency(value)
                    }
                }
            }
        }
    });
}

function updateStatistics(allTransactions, expenses) {
    const currentMonthTransactions = getCurrentMonthTransactions(allTransactions);
    const income = calculateByType(currentMonthTransactions, 'income');
    const totalExpense = calculateByType(currentMonthTransactions, 'expense');
    
    const categoryData = calculateByCategory(expenses);
    const topCategory = Object.entries(categoryData).sort((a, b) => b[1] - a[1])[0];
    
    const stats = [
        {
            label: 'Total Pemasukan',
            value: formatCurrency(income)
        },
        {
            label: 'Total Pengeluaran',
            value: formatCurrency(totalExpense)
        },
        {
            label: 'Saldo Bulan Ini',
            value: formatCurrency(income - totalExpense)
        },
        {
            label: 'Rata-rata Per Transaksi',
            value: formatCurrency(expenses.length > 0 ? totalExpense / expenses.length : 0)
        },
        {
            label: 'Kategori Terbesar',
            value: topCategory ? topCategory[0] : 'N/A'
        },
        {
            label: 'Jumlah Transaksi',
            value: currentMonthTransactions.length
        }
    ];

    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = stats.map(stat => `
        <div class="stat-item">
            <div class="stat-label">${stat.label}</div>
            <div class="stat-value">${stat.value}</div>
        </div>
    `).join('');
}

// ==================== PREDICTIONS ====================

function updatePredictions() {
    const currentMonthTransactions = getCurrentMonthTransactions(transactions);
    const income = calculateByType(currentMonthTransactions, 'income');
    const expenses = calculateByType(currentMonthTransactions, 'expense');
    const currentBalance = 0; // No initial balance feature; use 0 as start-of-month base

    // Predict end balance
    const prediction = predictEndMonthBalance(transactions, currentBalance);
    const status = getFinancialStatus(prediction);

    // Update prediction cards
    document.getElementById('endBalancePrediction').textContent = 
        formatCurrency(prediction.endBalance);
    
    const statusBadge = document.getElementById('statusBadge');
    statusBadge.innerHTML = `<i class="${status.icon}"></i> ${capitalize(status.label)}`;
    statusBadge.className = `status-badge ${status.status}`;

    document.getElementById('statusHint').textContent = 
        status.status === 'aman' ? '✨ Keuangan Anda sehat' : 
        status.status === 'warning' ? '⚠️ Perlu diperhatikan' : 
        '🚨 Kondisi kritis';

    document.getElementById('dailyAverage').textContent = 
        formatCurrency(Math.round(prediction.averageDailyExpense));

    // Update advice
    const advice = generateFinancialAdvice(transactions, currentBalance);
    const adviceContainer = document.getElementById('predictionAdvice');

    if (advice.length === 0) {
        adviceContainer.innerHTML = '<p class="empty-state">Belum ada data untuk analisis</p>';
        return;
    }

    adviceContainer.innerHTML = advice.map(item => `
        <div class="advice-item ${item.type}">
            <div class="advice-title">
                <i class="${item.icon}"></i>
                ${item.title}
            </div>
            <p class="advice-desc">${item.description}</p>
        </div>
    `).join('');
}

// ==================== GOALS FUNCTIONS ====================

function loadGoals() {
    const saved = getData('smartbudget_goals', []);
    goals = saved;
}

function saveGoals() {
    saveData('smartbudget_goals', goals);
}

function handleAddGoal(e) {
    e.preventDefault();
    const name = document.getElementById('goalName').value.trim();
    const target = parseFloat(document.getElementById('goalTarget').value);
    const deadline = document.getElementById('goalDeadline').value;
    const category = document.getElementById('goalCategory').value;

    if (!name || !target || !deadline) {
        showToast('Semua field harus diisi', 'error');
        return;
    }

    const goal = {
        id: Date.now(),
        name,
        target,
        deadline,
        category,
        saved: 0,
        createdAt: new Date().toISOString()
    };

    goals.push(goal);
    saveGoals();
    e.target.reset();
    renderGoals();
    updateHealth();
    showToast(`Target "${name}" berhasil dibuat!`, 'success');
}

function renderGoals() {
    const container = document.getElementById('goalsList');
    if (!container) return;

    if (!goals || goals.length === 0) {
        container.innerHTML = '<p class="empty-state">Belum ada target - mulai buat target finansial Anda!</p>';
        return;
    }

    container.innerHTML = goals.map(goal => {
        const progressPercent = Math.min((goal.saved / goal.target) * 100, 100);
        const remaining = goal.target - goal.saved;
        const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));

        return `
            <div class="goal-card">
                <div class="goal-header">
                    <span class="goal-title">${goal.name}</span>
                    <span class="goal-category">${goal.category}</span>
                </div>
                <div class="goal-progress">
                    <div class="goal-progress-label">
                        <span>Progres</span>
                        <span>${Math.round(progressPercent)}%</span>
                    </div>
                    <div class="goal-progress-bar">
                        <div class="goal-progress-fill" style="width:${progressPercent}%;"></div>
                    </div>
                </div>
                <div class="goal-stats">
                    <div class="goal-stat">
                        <div class="goal-stat-label">Terkumpul</div>
                        <div class="goal-stat-value">${formatCurrency(goal.saved)}</div>
                    </div>
                    <div class="goal-stat">
                        <div class="goal-stat-label">Sisa</div>
                        <div class="goal-stat-value">${formatCurrency(Math.max(remaining, 0))}</div>
                    </div>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 1rem; text-align: center;">
                    ${daysLeft > 0 ? `${daysLeft} hari tersisa` : 'Deadline sudah terlewat'}
                </div>
                <div class="goal-actions">
                    <button class="goal-edit" onclick="editGoal(${goal.id})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="goal-delete" onclick="deleteGoal(${goal.id})"><i class="fas fa-trash"></i> Hapus</button>
                </div>
            </div>
        `;
    }).join('');
}

function deleteGoal(id) {
    if (confirm('Hapus target ini?')) {
        goals = goals.filter(g => g.id !== id);
        saveGoals();
        renderGoals();
        updateHealth();
        showToast('Target berhasil dihapus', 'success');
    }
}

// ==================== EDIT TRANSACTION FUNCTIONS ====================

function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) {
        showToast('Transaksi tidak ditemukan', 'error');
        return;
    }

    // Set form values
    document.getElementById('editTxAmount').value = transaction.amount;
    document.getElementById('editTxDescription').value = transaction.description;
    document.getElementById('editTxType').value = transaction.type;
    document.getElementById('editTxCategory').value = transaction.category;
    document.getElementById('editTxDate').value = transaction.date;

    // Store current transaction ID in a data attribute
    document.getElementById('editTransactionForm').dataset.txId = transaction.id;

    // Show modal
    const modal = document.getElementById('editTransactionModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function closeEditTransactionModal() {
    const modal = document.getElementById('editTransactionModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function saveEditTransaction() {
    const txId = parseInt(document.getElementById('editTransactionForm').dataset.txId);
    const amount = parseFloat(document.getElementById('editTxAmount').value);
    const description = document.getElementById('editTxDescription').value.trim();
    const type = document.getElementById('editTxType').value;
    const category = document.getElementById('editTxCategory').value;
    const date = document.getElementById('editTxDate').value;

    if (!amount || !description || !date) {
        showToast('Semua field harus diisi', 'error');
        return;
    }

    const transaction = transactions.find(t => t.id === txId);
    if (!transaction) {
        showToast('Transaksi tidak ditemukan', 'error');
        return;
    }

    // Update transaction
    transaction.amount = amount;
    transaction.description = description;
    transaction.type = type;
    transaction.category = category;
    transaction.date = date;

    saveData('transactions', transactions);
    closeEditTransactionModal();
    updateDashboard();
    showToast(`Transaksi "${description}" berhasil diperbarui!`, 'success');
}

// ==================== EDIT GOAL FUNCTIONS ====================

function editGoal(id) {
    const goal = goals.find(g => g.id === id);
    if (!goal) {
        showToast('Target tidak ditemukan', 'error');
        return;
    }

    // Set form values
    document.getElementById('editGoalName').value = goal.name;
    document.getElementById('editGoalTarget').value = goal.target;
    document.getElementById('editGoalDeadline').value = goal.deadline;
    document.getElementById('editGoalCategory').value = goal.category;
    document.getElementById('editGoalSaved').value = goal.saved;

    // Store current goal ID in a data attribute
    document.getElementById('editGoalForm').dataset.goalId = goal.id;

    // Show modal
    const modal = document.getElementById('editGoalModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function closeEditGoalModal() {
    const modal = document.getElementById('editGoalModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function saveEditGoal() {
    const goalId = parseInt(document.getElementById('editGoalForm').dataset.goalId);
    const name = document.getElementById('editGoalName').value.trim();
    const target = parseFloat(document.getElementById('editGoalTarget').value);
    const deadline = document.getElementById('editGoalDeadline').value;
    const category = document.getElementById('editGoalCategory').value;
    const saved = parseFloat(document.getElementById('editGoalSaved').value);

    if (!name || !target || !deadline) {
        showToast('Semua field harus diisi', 'error');
        return;
    }

    const goal = goals.find(g => g.id === goalId);
    if (!goal) {
        showToast('Target tidak ditemukan', 'error');
        return;
    }

    // Update goal
    goal.name = name;
    goal.target = target;
    goal.deadline = deadline;
    goal.category = category;
    goal.saved = saved;

    saveGoals();
    closeEditGoalModal();
    renderGoals();
    updateHealth();
    showToast(`Target "${name}" berhasil diperbarui!`, 'success');
}

// ==================== FINANCIAL HEALTH FUNCTIONS ====================

function calculateHealthScore() {
    const currentMonthTransactions = getCurrentMonthTransactions(transactions);
    const income = calculateByType(currentMonthTransactions, 'income');
    const expenses = calculateByType(currentMonthTransactions, 'expense');
    
    let score = 50;

    // Factor 1: Expense Efficiency (max +25)
    if (income > 0) {
        const expenseRatio = expenses / income;
        if (expenseRatio <= 0.5) score += 25;
        else if (expenseRatio <= 0.7) score += 15;
        else if (expenseRatio <= 0.85) score += 8;
        else score += 0;
    }

    // Factor 2: Goal Achievement (max +15)
    if (goals.length > 0) {
        const completedGoals = goals.filter(g => g.saved >= g.target).length;
        const goalProgress = completedGoals / goals.length;
        score += Math.round(goalProgress * 15);
    }

    // Factor 3: Income Stability (max +10)
    if (currentMonthTransactions.filter(t => t.type === 'income').length >= 2) {
        score += 10;
    }

    return Math.min(Math.max(score, 0), 100);
}

function updateHealth() {
    const healthScore = calculateHealthScore();
    const currentMonthTransactions = getCurrentMonthTransactions(transactions);
    const income = calculateByType(currentMonthTransactions, 'income');
    const expenses = calculateByType(currentMonthTransactions, 'expense');
    const savings = income - expenses;

    // Update score display
    document.getElementById('healthScore').textContent = healthScore;

    // Update health message
    let message = 'Kesehatan finansial Anda sangat baik!';
    if (healthScore < 40) message = 'Kesehatan finansial perlu ditingkatkan.';
    else if (healthScore < 60) message = 'Kesehatan finansial cukup baik, tapi ada ruang untuk improve.';
    else if (healthScore < 80) message = 'Kesehatan finansial Anda baik!';
    
    document.getElementById('healthScoreDetails').innerHTML = `<p>${message}</p>`;

    // Update metrics
    const expenseEfficiency = income > 0 ? Math.min((1 - (expenses / income)) * 100, 100) : 0;
    const goalProgress = goals.length > 0 ? (goals.filter(g => g.saved >= g.target).length / goals.length) * 100 : 0;
    const incomeStability = currentMonthTransactions.filter(t => t.type === 'income').length >= 2 ? 85 : 50;
    const savingsRate = income > 0 ? Math.min((savings / income) * 100, 100) : 0;

    document.getElementById('metricExpense').style.width = expenseEfficiency + '%';
    document.getElementById('metricExpenseText').textContent = Math.round(expenseEfficiency) + '%';
    document.getElementById('metricGoal').style.width = goalProgress + '%';
    document.getElementById('metricGoalText').textContent = Math.round(goalProgress) + '%';
    document.getElementById('metricIncome').style.width = incomeStability + '%';
    document.getElementById('metricIncomeText').textContent = Math.round(incomeStability) + '%';
    document.getElementById('metricSavings').style.width = Math.max(savingsRate, 0) + '%';
    document.getElementById('metricSavingsText').textContent = Math.round(Math.max(savingsRate, 0)) + '%';

    // Update insights
    updateHealthInsights(healthScore, expenseEfficiency, savingsRate, goalProgress);
    updateWeeklySummary();
}

function updateHealthInsights(score, expense, savings, goals) {
    const insights = [];

    if (score >= 80) {
        insights.push({
            title: '✅ Kesehatan Finansial Sangat Baik',
            text: 'Terus pertahankan pola pengeluaran yang sehat dan jangan ragu untuk meningkatkan target tabungan Anda.'
        });
    }

    if (expense < 50) {
        insights.push({
            title: '💚 Pengeluaran Terkontrol',
            text: 'Anda mengeluarkan kurang dari setengah penghasilan. Lanjutkan disiplin ini!'
        });
    } else if (expense > 80) {
        insights.push({
            title: '⚠️ Pengeluaran Tinggi',
            text: 'Pengeluaran Anda melebihi 80% penghasilan. Coba kurangi pengeluaran untuk menabung lebih banyak.'
        });
    }

    if (savings > 20) {
        insights.push({
            title: '🎯 Target Tabungan Tercapai',
            text: `Anda berhasil menabung ${Math.round(savings)}% dari penghasilan. Pertahankan momentum ini!`
        });
    }

    if (goals.length > 0 && goals >= 50) {
        insights.push({
            title: '🏆 Target Tercapai',
            text: 'Setidaknya setengah dari target finansial Anda sudah tercapai. Bagus!'
        });
    }

    const container = document.getElementById('healthInsights');
    if (!container) return;

    if (insights.length === 0) {
        container.innerHTML = '<p class="empty-state">Mulai catat transaksi untuk mendapat insights</p>';
    } else {
        container.innerHTML = insights.map(insight => `
            <div class="insight-item">
                <div class="insight-title">${insight.title}</div>
                <div class="insight-text">${insight.text}</div>
            </div>
        `).join('');
    }
}

function updateWeeklySummary() {
    const container = document.getElementById('weeklySummary');
    if (!container) return;

    const today = new Date();
    const weekData = {};

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date);

        const dayTransactions = transactions.filter(t => t.date === dateStr && t.type === 'expense');
        const dayExpense = dayTransactions.reduce((sum, t) => sum + t.amount, 0);

        weekData[dayName] = dayExpense;
    }

    container.innerHTML = Object.entries(weekData).map(([day, amount]) => `
        <div class="weekly-card">
            <div class="weekly-label">${day}</div>
            <div class="weekly-value">${formatCurrency(amount)}</div>
        </div>
    `).join('');
}

// ==================== THEME FUNCTIONS ====================

function initializeTheme() {
    const theme = localStorage.getItem('smartbudget_theme') || 'light';
    setTheme(theme);

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettingsModal);
    }

    // Close modal when clicking outside
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
        window.addEventListener('click', function(e) {
            if (e.target === settingsModal) {
                closeSettingsModal();
            }
        });
    }

    // Close editGoalModal when clicking outside
    const editGoalModal = document.getElementById('editGoalModal');
    if (editGoalModal) {
        window.addEventListener('click', function(e) {
            if (e.target === editGoalModal) {
                closeEditGoalModal();
            }
        });
    }

    // Initialize language control and reset button inside settings modal
    initializeLanguage();

    const resetBtn = document.getElementById('resetAllBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAllData);
    }

    // Wire theme buttons (in case they exist)
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setTheme(this.dataset.theme);
        });
    });
}

function setTheme(theme) {
    const html = document.documentElement;

    // Only support 'dark' and 'light' here. Any other value will default to 'light'.
    if (theme !== 'dark') theme = 'light';

    if (theme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        document.body.style.background = '#0f172a';
    } else {
        html.setAttribute('data-theme', 'light');
        document.body.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)';
    }

    localStorage.setItem('smartbudget_theme', theme);

    // Update active button
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.theme-btn[data-theme="${theme}"]`)?.classList.add('active');
}

// ==================== DASHBOARD DATE NAVIGATION ====================

function getFirstTransactionDate() {
    if (!transactions || transactions.length === 0) return getTodayDate();
    const dates = transactions.map(t => t.date).filter(Boolean);
    if (dates.length === 0) return getTodayDate();
    return dates.reduce((min, d) => d < min ? d : min, dates[0]);
}

function initializeDashboardDate() {
    const picker = document.getElementById('dashboardDatePicker');
    const prev = document.getElementById('prevDateBtn');
    const next = document.getElementById('nextDateBtn');
    const monthSel = document.getElementById('dashboardMonthSelect');
    const yearSel = document.getElementById('dashboardYearSelect');

    const firstDate = getFirstTransactionDate();
    const today = getTodayDate();

    // If compact selects are present, populate and wire them
    if (monthSel && yearSel) {
        const monthNames = Array.from({length:12}, (v,i) => new Intl.DateTimeFormat('id-ID',{month:'long'}).format(new Date(2000, i, 1)));
        monthSel.innerHTML = '';
        monthNames.forEach((name, idx) => {
            const opt = document.createElement('option');
            const m = String(idx + 1).padStart(2,'0');
            opt.value = m;
            opt.textContent = name;
            monthSel.appendChild(opt);
        });

        const firstYear = parseInt(firstDate.substring(0,4), 10);
        const currentYear = new Date().getFullYear();
        yearSel.innerHTML = '';
        for (let y = currentYear; y >= firstYear; y--) {
            const opt = document.createElement('option');
            opt.value = String(y);
            opt.textContent = String(y);
            yearSel.appendChild(opt);
        }

        // set current values
        const [cy, cm] = selectedDate.split('-');
        monthSel.value = cm;
        yearSel.value = cy;
    }

    // If original month input exists (fallback), keep previous behavior
    if (picker) {
        const currentMonth = selectedDate.substring(0, 7);
        picker.value = currentMonth;
        const firstMonth = firstDate.substring(0, 7);
        const todayMonth = today.substring(0, 7);
        picker.min = firstMonth;
        picker.max = todayMonth;
        const newPicker = picker.cloneNode(true);
        picker.parentNode.replaceChild(newPicker, picker);
        const pickerNew = document.getElementById('dashboardDatePicker');
        if (pickerNew) {
            pickerNew.addEventListener('change', function() {
                const monthStr = this.value;
                setDashboardDate(monthStr + '-01');
                renderDayPicker();
            });
        }
    }

    // Ensure prev/next buttons get fresh listeners
    if (prev) {
        const newPrev = prev.cloneNode(true);
        prev.parentNode.replaceChild(newPrev, prev);
        document.getElementById('prevDateBtn')?.addEventListener('click', function(e) {
            e.preventDefault();
            prevMonth();
        });
    }

    if (next) {
        const newNext = next.cloneNode(true);
        next.parentNode.replaceChild(newNext, next);
        document.getElementById('nextDateBtn')?.addEventListener('click', function(e) {
            e.preventDefault();
            nextMonth();
        });
    }

    

    updateDashboardDateUI(selectedDate);
    renderDayPicker();
}

function renderDayPicker() {
    const grid = document.getElementById('dayPickerGrid');
    if (!grid) return;

    const currentMonth = selectedDate.substring(0, 7); // YYYY-MM
    const [year, month] = currentMonth.split('-').map(Number);
    
    // Get days in month
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDate = getFirstTransactionDate();
    const today = getTodayDate();

    grid.innerHTML = '';

    // populate compact month/year selects if present
    const monthSel = document.getElementById('dashboardMonthSelect');
    const yearSel = document.getElementById('dashboardYearSelect');
    if (monthSel && yearSel) {
        const monthNames = Array.from({length:12}, (v,i) => new Intl.DateTimeFormat('id-ID',{month:'long'}).format(new Date(2000, i, 1)));
        monthSel.innerHTML = '';
        monthNames.forEach((name, idx) => {
            const opt = document.createElement('option');
            const m = String(idx + 1).padStart(2,'0');
            opt.value = m;
            opt.textContent = name;
            monthSel.appendChild(opt);
        });
        // year range
        const firstYear = parseInt(getFirstTransactionDate().substring(0,4), 10);
        const currentYear = new Date().getFullYear();
        yearSel.innerHTML = '';
        for (let y = currentYear; y >= firstYear; y--) {
            const opt = document.createElement('option');
            opt.value = String(y);
            opt.textContent = String(y);
            yearSel.appendChild(opt);
        }
        // set current values
        monthSel.value = String(month).padStart(2,'0');
        yearSel.value = String(year);
    }

    // Prepare map of transactions for this month to compute per-day totals and markers
    const monthTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === year && (d.getMonth() + 1) === month;
    });

    // Generate day buttons
    for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = String(day).padStart(2, '0');
        const fullDate = `${year}-${String(month).padStart(2, '0')}-${dayStr}`;
        
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'day-picker-button';
        btn.textContent = day;
        
        // Check if date is within valid range
        const isInRange = fullDate >= firstDate && fullDate <= today;
        btn.disabled = !isInRange;
        
        // Check if it's the selected date
        if (fullDate === selectedDate) {
            btn.classList.add('selected');
        }
        
        // If there are transactions on this day, mark and add a small dot with tooltip
        const txOnDay = monthTransactions.filter(t => t.date === fullDate);
        if (txOnDay && txOnDay.length > 0) {
            btn.classList.add('has-transactions');
            const incomeOnDay = txOnDay.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const expenseOnDay = txOnDay.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            const badge = document.createElement('span');
            badge.className = 'day-badge ' + (incomeOnDay >= expenseOnDay ? 'income' : 'expense');
            badge.title = `Pemasukan: ${formatCurrency(incomeOnDay)}\nPengeluaran: ${formatCurrency(expenseOnDay)}`;
            btn.appendChild(badge);
        }

        btn.addEventListener('click', function() {
            if (!btn.disabled) {
                setDashboardDate(fullDate);
                renderDayPicker(); // Re-render to update selection highlight
            }
        });
        
        grid.appendChild(btn);
    }
}

function prevMonth() {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() - 1);
    const newDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
    setDashboardDate(newDate);
    renderDayPicker();
}

function nextMonth() {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + 1);
    const newDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
    setDashboardDate(newDate);
    renderDayPicker();
}

// Update the day details panel for a specific date (YYYY-MM-DD)
function updateDayDetails(dateStr) {
    const container = document.getElementById('dayDetails');
    const list = document.getElementById('dayTransactionsList');
    const dateLabel = document.getElementById('daySummaryDate');
    const incomeEl = document.getElementById('dayTotalIncome');
    const expenseEl = document.getElementById('dayTotalExpense');
    const balanceEl = document.getElementById('dayTotalBalance');

    if (!container || !list || !dateLabel || !incomeEl || !expenseEl || !balanceEl) return;

    if (!dateStr) {
        dateLabel.textContent = 'Pilih tanggal';
        list.innerHTML = '<p class="empty-state">Pilih tanggal untuk melihat detail transaksi</p>';
        incomeEl.textContent = formatCurrency(0);
        expenseEl.textContent = formatCurrency(0);
        balanceEl.textContent = formatCurrency(0);
        return;
    }

    const txOnDay = transactions.filter(t => t.date === dateStr).sort((a,b)=> new Date(b.date) - new Date(a.date));
    const incomeOnDay = txOnDay.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenseOnDay = txOnDay.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = incomeOnDay - expenseOnDay;

    dateLabel.textContent = formatDate(dateStr);
    incomeEl.textContent = formatCurrency(incomeOnDay);
    expenseEl.textContent = formatCurrency(expenseOnDay);
    balanceEl.textContent = formatCurrency(balance);

    if (!txOnDay || txOnDay.length === 0) {
        list.innerHTML = '<p class="empty-state">Tidak ada transaksi pada tanggal ini</p>';
        return;
    }

    list.innerHTML = txOnDay.map(transaction => `
        <div class="transaction-item ${transaction.type}">
            <div class="transaction-left">
                <div class="transaction-icon">
                    <i class="fas fa-${transaction.type === 'income' ? 'arrow-down' : 'arrow-up'}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${transaction.description}</h4>
                    <p>${transaction.category} • ${formatDate(transaction.date)}</p>
                </div>
            </div>
            <div class="transaction-right">
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}
                </div>
                <button class="transaction-delete" onclick="deleteTransaction(${transaction.id})" title="Hapus">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// --- Modal two-month calendar (detailed date selection UI like the attachment) ---
let modalBaseMonth = null; // YYYY-MM for left calendar
let selectedModalDate = null; // YYYY-MM-DD selected inside modal

function openDateModal() {
    const modal = document.getElementById('datePickerModal');
    if (!modal) return;
    // initialize base month to selectedDate's month
    modalBaseMonth = selectedDate ? selectedDate.substring(0,7) : getTodayDate().substring(0,7);
    selectedModalDate = selectedDate;
    renderModalCalendars();
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');

    // wire modal controls
    document.getElementById('modalPrevMonth')?.addEventListener('click', function(){ modalShiftMonth(-1); });
    document.getElementById('modalNextMonth')?.addEventListener('click', function(){ modalShiftMonth(1); });
    document.getElementById('modalViewSelect')?.addEventListener('change', renderModalCalendars);
    // year selector - populate and listen
    const yearSel = document.getElementById('modalYearSelect');
    if (yearSel) {
        yearSel.addEventListener('change', function(){
            const y = parseInt(this.value, 10);
            const [, m] = modalBaseMonth.split('-');
            modalBaseMonth = `${y}-${m}`;
            renderModalCalendars();
        });
    }
}

function closeDateModal() {
    const modal = document.getElementById('datePickerModal');
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
}

function applyDateFromModal() {
    if (!selectedModalDate) {
        closeDateModal();
        return;
    }
    // Allow modal to set any date visible in the modal (no clamping)
    setDashboardDate(selectedModalDate, true);
    closeDateModal();
}

function modalShiftMonth(delta) {
    // modalBaseMonth YYYY-MM
    let [y,m] = modalBaseMonth.split('-').map(Number);
    m += delta;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    modalBaseMonth = `${y}-${String(m).padStart(2,'0')}`;
    renderModalCalendars();
}

function renderModalCalendars() {
    const left = document.getElementById('modalCalLeft');
    const right = document.getElementById('modalCalRight');
    const label = document.getElementById('modalCurrentLabel');
    if (!left || !right || !label) return;

    const view = document.getElementById('modalViewSelect')?.value || 'two';
    // left month
    const [ly, lm] = modalBaseMonth.split('-').map(Number);
    // right month is next month
    let ry = ly; let rm = lm + 1;
    if (rm > 12) { rm = 1; ry += 1; }

    left.innerHTML = '';
    right.innerHTML = '';

    renderSingleMonthCalendar(left, ly, lm);
    if (view === 'two') {
        renderSingleMonthCalendar(right, ry, rm);
        right.style.display = '';
    } else {
        right.style.display = 'none';
    }

    const d = new Date(modalBaseMonth + '-01');
    const formatter = new Intl.DateTimeFormat('id-ID', { month:'long', year:'numeric' });
    label.textContent = formatter.format(d);

    // populate year selector range (from first transaction year to current year +1)
    const yearSel = document.getElementById('modalYearSelect');
    if (yearSel) {
        const firstYear = parseInt(getFirstTransactionDate().substring(0,4), 10);
        const currentYear = new Date().getFullYear();
        const maxYear = currentYear + 1;
        // avoid rebuilding if already correct
        yearSel.innerHTML = '';
        for (let y = maxYear; y >= firstYear; y--) {
            const opt = document.createElement('option');
            opt.value = String(y);
            opt.textContent = String(y);
            yearSel.appendChild(opt);
        }
        yearSel.value = String(d.getFullYear());
    }
}

function renderSingleMonthCalendar(container, year, month) {
    const firstDate = getFirstTransactionDate();
    const today = getTodayDate();
    const daysInMonth = new Date(year, month, 0).getDate();

    // Month header with weekdays
    const header = document.createElement('div');
    header.style.marginBottom = '0.5rem';
    const weekNames = ['Mo','Tu','We','Th','Fr','Sa','Su'];
    const wk = document.createElement('div');
    wk.style.display = 'grid';
    wk.style.gridTemplateColumns = 'repeat(7,1fr)';
    wk.style.gap = '0.25rem';
    weekNames.forEach(w => { const el = document.createElement('div'); el.textContent = w; el.style.opacity = '0.7'; el.style.fontSize='0.8rem'; el.style.textAlign='center'; wk.appendChild(el); });
    container.appendChild(wk);

    // Determine first day of week (Monday=1)
    const firstWeekday = new Date(year, month-1, 1).getDay(); // 0=Sun
    // convert to Monday-first index (0..6)
    const offset = (firstWeekday + 6) % 7;

    const grid = document.createElement('div');
    grid.className = 'day-picker-grid';
    grid.style.marginTop = '0.5rem';
    grid.style.gridTemplateColumns = 'repeat(7,1fr)';

    // Fill placeholders for offset
    for (let i=0;i<offset;i++){
        const ph = document.createElement('div');
        grid.appendChild(ph);
    }

    for (let d=1; d<=daysInMonth; d++) {
        const dayStr = String(d).padStart(2,'0');
        const fullDate = `${year}-${String(month).padStart(2,'0')}-${dayStr}`;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'day-picker-button';
        btn.textContent = d;
        btn.dataset.date = fullDate;
        // Allow clicking any date inside the modal's displayed month
        btn.disabled = false;
        if (fullDate === selectedModalDate) btn.classList.add('selected');
        btn.addEventListener('click', function(){
            // clear previous selection
            document.querySelectorAll('#datePickerModal .day-picker-button.selected').forEach(b=>b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedModalDate = fullDate;
        });
        grid.appendChild(btn);
    }

    container.appendChild(grid);
}

function updateDashboardDateUI(dateStr) {
    const firstDate = getFirstTransactionDate();
    const today = getTodayDate();
    const prev = document.getElementById('prevDateBtn');
    const next = document.getElementById('nextDateBtn');
    const picker = document.getElementById('dashboardDatePicker');
    const label = document.getElementById('dateDisplayLabel');

    const currentMonth = dateStr.substring(0, 7);
    const firstMonth = firstDate.substring(0, 7);
    const todayMonth = today.substring(0, 7);

    const monthSel = document.getElementById('dashboardMonthSelect');
    const yearSel = document.getElementById('dashboardYearSelect');

    if (monthSel && yearSel) {
        const [y, m] = currentMonth.split('-');
        monthSel.value = m;
        yearSel.value = y;
    }

    // Only disable prev if at or before first month
    if (prev) prev.disabled = currentMonth <= firstMonth;
    
    // Only disable next if at or after current month
    if (next) next.disabled = currentMonth >= todayMonth;

    // Update date label (if present) to show month and year
    if (label) {
        const d = new Date(dateStr);
        const formatter = new Intl.DateTimeFormat('id-ID', { 
            month: 'long', 
            year: 'numeric' 
        });
        label.textContent = formatter.format(d);
    }
}

function setDashboardDate(dateStr, allowOutOfRange = false) {
    if (!dateStr) return;
    const firstDate = getFirstTransactionDate();
    const today = getTodayDate();
    if (!allowOutOfRange) {
        if (dateStr < firstDate) dateStr = firstDate;
        if (dateStr > today) dateStr = today;
    }
    selectedDate = dateStr;
    updateDashboard();
}

// Initialize language selector and storage
function initializeLanguage() {
    const lang = localStorage.getItem('smartbudget_lang') || 'id';
    document.documentElement.lang = lang;

    const sel = document.getElementById('languageSelect');
    if (sel) {
        sel.value = lang;
        sel.addEventListener('change', function() {
            saveLanguage(this.value);
        });
    }
}

function saveLanguage(lang) {
    if (!['id','en'].includes(lang)) lang = 'id';
    localStorage.setItem('smartbudget_lang', lang);
    document.documentElement.lang = lang;
    showToast('Bahasa disimpan: ' + (lang === 'id' ? 'Bahasa Indonesia' : 'English'), 'success');
}

function resetAllData() {
    if (!confirm('Yakin ingin menghapus semua data dan pengaturan? Tindakan ini tidak bisa dibatalkan.')) return;
    // Clear all localStorage keys related to SmartBudget
    try {
        // Best-effort: clear everything to satisfy user's request
        localStorage.clear();
        showToast('Semua data dan pengaturan telah dihapus. Memuat ulang aplikasi...', 'success', 2000);
        setTimeout(() => {
            location.reload();
        }, 800);
    } catch (e) {
        console.error('Gagal menghapus data:', e);
        showToast('Gagal menghapus data. Buka console untuk detail.', 'error');
    }
}

function openSettingsModal() {
    document.getElementById('settingsModal').classList.add('show');
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('show');
}

// ==================== MANUAL BOOK FUNCTIONS ====================

function openManualBook() {
    const popup = document.getElementById('manualBookPopup');
    if (popup) {
        popup.classList.add('show');
    }
}

function closeManualBook() {
    const popup = document.getElementById('manualBookPopup');
    if (popup) {
        popup.classList.remove('show');
    }
}

// Close manual book when clicking outside of it
window.addEventListener('click', function(e) {
    const popup = document.getElementById('manualBookPopup');
    const manualBookBtn = document.getElementById('manualBookBtn');
    if (popup && e.target !== popup && !popup.contains(e.target) && e.target !== manualBookBtn && !manualBookBtn.contains(e.target)) {
        popup.classList.remove('show');
    }
});

// Close edit transaction modal when clicking outside of it
window.addEventListener('click', function(e) {
    const modal = document.getElementById('editTransactionModal');
    const modalContent = modal ? modal.querySelector('.modal-content') : null;
    if (modal && e.target === modal) {
        closeEditTransactionModal();
    }
});

// ==================== PAGE LOAD ====================

// Optional: preload sample data for demo if no transactions exist
if (transactions.length === 0) {
    // Uncomment to inject demo transactions for testing
    /*
    const sampleData = [
        { id: 1, amount: 1000000, description: 'Gaji Bulanan', type: 'income', category: 'Gaji & Pemasukan', date: getTodayDate() },
        { id: 2, amount: 50000, description: 'Beli Kopi', type: 'expense', category: 'Makanan & Minuman', date: getTodayDate() },
        { id: 3, amount: 75000, description: 'Isi Bensin', type: 'expense', category: 'Transportasi', date: getTodayDate() }
    ];
    transactions = sampleData;
    saveTransactions();
    updateDashboard();
    */
}
