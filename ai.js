// ==================== AI RECOMMENDATIONS & PREDICTIONS ====================

// Generate smart spending recommendations
function generateRecommendations(transactions) {
    const recommendations = [];
    
    if (transactions.length === 0) {
        return recommendations;
    }
    
    const currentMonthTransactions = getCurrentMonthTransactions(transactions);
    const expenses = currentMonthTransactions.filter(t => t.type === 'expense');
    
    if (expenses.length === 0) {
        return recommendations;
    }
    
    // 1. Check category overspending
    const categorySpending = calculateByCategory(expenses);
    const avgSpendPerCategory = Object.values(categorySpending).reduce((a, b) => a + b, 0) / 
                                Object.keys(categorySpending).length;
    
    for (const [category, amount] of Object.entries(categorySpending)) {
        if (amount > avgSpendPerCategory * 1.5) {
            const excess = amount - (avgSpendPerCategory * 1.2);
            recommendations.push({
                type: 'warning',
                icon: 'fas fa-exclamation-triangle',
                title: `⚠️ Pengeluaran "${category}" Tinggi`,
                description: `Anda menghabiskan ${formatCurrency(amount)} untuk ${category}. Coba kurangi sebesar ${formatCurrency(excess)} untuk optimalisasi.`,
                priority: 'high'
            });
        }
    }
    
    // 2. Food spending analysis
    const foodSpending = categorySpending['Makanan & Minuman'] || 0;
    const totalSpending = Object.values(categorySpending).reduce((a, b) => a + b, 0);
    const foodPercentage = (foodSpending / totalSpending) * 100;
    
    if (foodPercentage > 35) {
        recommendations.push({
            type: 'warning',
            icon: 'fas fa-utensils',
            title: '🍽️ Pengeluaran Makanan Cukup Besar',
            description: `${Math.round(foodPercentage)}% dari total pengeluaran Anda untuk makanan. Coba masak sendiri atau membawa bekal.`,
            priority: 'medium'
        });
    }
    
    // 3. Daily spending pattern
    const dailyAverage = getAverageDailySpending(currentMonthTransactions);
    const lastFiveTransactions = expenses.slice(-5);
    const recentAverage = lastFiveTransactions.length > 0 ? 
        lastFiveTransactions.reduce((sum, t) => sum + t.amount, 0) / lastFiveTransactions.length : 0;
    
    if (recentAverage > dailyAverage * 1.3) {
        recommendations.push({
            type: 'danger',
            icon: 'fas fa-chart-line',
            title: '📈 Tren Pengeluaran Meningkat',
            description: `Pengeluaran rata-rata Anda naik. Periksa kembali transaksi baru untuk mengetahui penyebabnya.`,
            priority: 'high'
        });
    }
    
    // 4. Transportation spending
    const transportSpending = categorySpending['Transportasi'] || 0;
    if (transportSpending > 0) {
        const transportPercentage = (transportSpending / totalSpending) * 100;
        if (transportPercentage > 20) {
            recommendations.push({
                type: 'warning',
                icon: 'fas fa-car',
                title: '🚗 Biaya Transportasi Tinggi',
                description: `${Math.round(transportPercentage)}% budget untuk transportasi. Pertimbangkan carpooling atau transportasi publik.`,
                priority: 'medium'
            });
        }
    }
    
    // 5. Entertainment spending
    const entertainmentSpending = categorySpending['Hiburan & Rekreasi'] || 0;
    if (entertainmentSpending > 0) {
        const entertainmentPercentage = (entertainmentSpending / totalSpending) * 100;
        if (entertainmentPercentage > 20) {
            recommendations.push({
                type: 'info',
                icon: 'fas fa-gamepad',
                title: '🎮 Hiburan dan Rekreasi',
                description: `Anda menghabiskan ${formatCurrency(entertainmentSpending)} untuk hiburan. Hemat dengan menggunakan subscrition sharing atau aktivitas gratis.`,
                priority: 'low'
            });
        }
    }
    
    // 6. Shopping habits
    const shoppingSpending = categorySpending['Belanja & Kebutuhan'] || 0;
    if (shoppingSpending > 0) {
        const shoppingPercentage = (shoppingSpending / totalSpending) * 100;
        if (shoppingPercentage > 25) {
            recommendations.push({
                type: 'warning',
                icon: 'fas fa-shopping-bag',
                title: '🛍️ Belanja Impulse Tinggi',
                description: `Anda menghabiskan ${formatCurrency(shoppingSpending)} untuk belanja. Buat list kebutuhan sebelum berbelanja.`,
                priority: 'medium'
            });
        }
    }
    
    // 7. Positive recommendation
    if (recommendations.length === 0) {
        recommendations.push({
            type: 'success',
            icon: 'fas fa-thumbs-up',
            title: '✅ Pengeluaran Terkontrol',
            description: 'Pola pengeluaran Anda sangat baik! Terus pertahankan keseimbangan ini.',
            priority: 'low'
        });
    } else {
        // Add positive note if no critical issues
        const criticalIssues = recommendations.filter(r => r.priority === 'high');
        if (criticalIssues.length === 0) {
            recommendations.unshift({
                type: 'success',
                icon: 'fas fa-check-circle',
                title: '💡 Pola Pengeluaran Cukup Baik',
                description: 'Beberapa area bisa dioptimalkan, tapi secara umum keuangan Anda sehat.',
                priority: 'low'
            });
        }
    }
    
    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// Predict end of month balance
function predictEndMonthBalance(transactions, currentBalance = 0) {
    const currentMonthTransactions = getCurrentMonthTransactions(transactions);
    
    const income = calculateByType(currentMonthTransactions, 'income');
    const expenses = calculateByType(currentMonthTransactions, 'expense');
    
    const daysInMonth = getDaysInMonth();
    const daysRemaining = getRemainingDaysInMonth();
    const daysPassed = getDaysPassedInMonth();
    
    // Calculate daily average expense
    const averageDailyExpense = daysPassed === 0 ? 0 : expenses / daysPassed;
    
    // Predict remaining expenses
    const predictedRemainingExpense = averageDailyExpense * daysRemaining;
    
    // Calculate end month balance
    const totalExpectedExpense = expenses + predictedRemainingExpense;
    const endBalance = currentBalance + income - totalExpectedExpense;
    
    return {
        currentBalance,
        income,
        expenses,
        predictedRemainingExpense,
        totalExpectedExpense,
        endBalance,
        daysRemaining,
        averageDailyExpense,
        status: endBalance > 0 ? 'aman' : 'kritis'
    };
}

// Generate financial advice
function generateFinancialAdvice(transactions, currentBalance = 0) {
    const advice = [];
    
    if (transactions.length === 0) {
        advice.push({
            type: 'info',
            icon: 'fas fa-info-circle',
            title: '💡 Mulai Catat Transaksi',
            description: 'Mulai catat setiap pengeluaran untuk mendapat analisis keuangan yang akurat.'
        });
        return advice;
    }
    
    const prediction = predictEndMonthBalance(transactions, currentBalance);
    const currentMonthTransactions = getCurrentMonthTransactions(transactions);
    const expenses = currentMonthTransactions.filter(t => t.type === 'expense');
    
    // 1. Status advice
    if (prediction.endBalance < 0) {
        advice.push({
            type: 'danger',
            icon: 'fas fa-exclamation-circle',
            title: '⚠️ Peringatan Saldo Negatif',
            description: `Berdasarkan prediksi, Anda akan mengalami defisit sebesar ${formatCurrency(Math.abs(prediction.endBalance))} pada akhir bulan.`
        });
    } else if (prediction.endBalance < currentBalance * 0.2) {
        advice.push({
            type: 'warning',
            icon: 'fas fa-alert-triangle',
            title: '⚡ Saldo Mencukupi Tapi Terbatas',
            description: `Saldo akhir bulan akan menjadi ${formatCurrency(prediction.endBalance)}. Hemat lebih banyak untuk buffer.`
        });
    } else {
        advice.push({
            type: 'success',
            icon: 'fas fa-check-circle',
            title: '✅ Saldo Aman',
            description: `Proyeksi saldo akhir bulan: ${formatCurrency(prediction.endBalance)}. Keuangan Anda sehat!`
        });
    }
    
    // 2. Daily spending advice
    const dailyTarget = prediction.endBalance > 0 ? 
        Math.floor(prediction.averageDailyExpense * 0.9) : 
        Math.floor(prediction.averageDailyExpense * 0.7);
    
    advice.push({
        type: 'info',
        icon: 'fas fa-calendar-day',
        title: '📅 Target Pengeluaran Harian',
        description: `Target harian optimal: ${formatCurrency(dailyTarget)} (saat ini: ${formatCurrency(Math.round(prediction.averageDailyExpense))})`
    });
    
    // 3. Savings advice
    const potentialSavings = prediction.totalExpectedExpense * 0.1;
    advice.push({
        type: 'info',
        icon: 'fas fa-piggy-bank',
        title: '💰 Potensi Tabungan',
        description: `Dengan mengurangi 10% pengeluaran, Anda bisa menabung ${formatCurrency(potentialSavings)} per bulan.`
    });
    
    // 4. Month progress
    const progressPercentage = Math.round((getDaysPassedInMonth() / getDaysInMonth()) * 100);
    const spendingPercentage = prediction.expenses > 0 ? 
        Math.round((prediction.expenses / (prediction.totalExpectedExpense || 1)) * 100) : 0;
    
    if (progressPercentage > spendingPercentage) {
        advice.push({
            type: 'success',
            icon: 'fas fa-trending-down',
            title: '🎯 Pengeluaran Di Bawah Target',
            description: `Anda sudah melewati ${progressPercentage}% bulan tapi hanya mengeluarkan ${spendingPercentage}% budget. Terus pertahankan!`
        });
    } else if (progressPercentage < spendingPercentage) {
        advice.push({
            type: 'warning',
            icon: 'fas fa-trending-up',
            title: '⚠️ Pengeluaran Di Atas Target',
            description: `Anda sudah melewati ${progressPercentage}% bulan tapi sudah mengeluarkan ${spendingPercentage}% budget. Kurangi pengeluaran!`
        });
    }
    
    return advice;
}

// Get financial status
function getFinancialStatus(prediction) {
    if (prediction.endBalance < 0) {
        return {
            status: 'danger',
            label: 'Kritis',
            icon: 'fas fa-exclamation-circle'
        };
    } else if (prediction.endBalance < prediction.currentBalance * 0.2) {
        return {
            status: 'warning',
            label: 'Hati-Hati',
            icon: 'fas fa-alert-triangle'
        };
    } else {
        return {
            status: 'success',
            label: 'Aman',
            icon: 'fas fa-check-circle'
        };
    }
}

// Helper function to get average daily spending
function getAverageDailySpending(transactions) {
    if (transactions.length === 0) return 0;
    
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return 0;
    
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const daysPassed = getDaysPassedInMonth();
    
    return totalExpense / Math.max(daysPassed, 1);
}

// Analyze cash flow
function analyzeCashFlow(transactions) {
    const currentMonth = getCurrentMonthTransactions(transactions);
    
    const income = calculateByType(currentMonth, 'income');
    const expenses = calculateByType(currentMonth, 'expense');
    const net = income - expenses;
    
    const incomeCount = currentMonth.filter(t => t.type === 'income').length;
    const expenseCount = currentMonth.filter(t => t.type === 'expense').length;
    
    const incomeAverage = incomeCount > 0 ? income / incomeCount : 0;
    const expenseAverage = expenseCount > 0 ? expenses / expenseCount : 0;
    
    return {
        income,
        expenses,
        net,
        incomeCount,
        expenseCount,
        incomeAverage,
        expenseAverage,
        incomePercentage: income > 0 ? 100 : 0,
        expensePercentage: income > 0 ? (expenses / income) * 100 : 0
    };
}
