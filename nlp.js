// ==================== NLP CATEGORY AUTO-DETECTION ====================

const CATEGORY_KEYWORDS = {
    'Makanan & Minuman': [
        'makan', 'minum', 'kopi', 'teh', 'mie', 'nasi', 'kue', 'roti', 'donat',
        'restoran', 'warung', 'cafe', 'kedai', 'gorengan', 'soto', 'bakso',
        'pizza', 'burger', 'ayam', 'daging', 'ikan', 'seafood', 'dessert',
        'snack', 'jajan', 'beli makanan', 'order makanan', 'delivery makanan'
    ],
    'Transportasi': [
        'bensin', 'bbm', 'solar', 'parkir', 'ojek', 'uber', 'gojek', 'taxi',
        'tol', 'bis', 'bus', 'kereta', 'pesawat', 'tiket', 'transportasi',
        'perjalanan', 'jalan', 'motor', 'mobil', 'service', 'bengkel',
        'oli', 'ban', 'spare part', 'SPBU', 'pom bensin', 'grab'
    ],
    'Belanja & Kebutuhan': [
        'beli', 'belanja', 'belanja online', 'belanja kebutuhan', 'groceries',
        'pakaian', 'sepatu', 'baju', 'celana', 'kasur', 'bantal', 'sprei',
        'peralatan', 'perlengkapan', 'alat rumah tangga', 'kualitas', 'kain',
        'retail', 'supermarket', 'toko', 'mall', 'online shop', 'marketplace'
    ],
    'Kesehatan & Kebugaran': [
        'dokter', 'apotek', 'obat', 'vitamin', 'kesehatan', 'rumah sakit',
        'klinik', 'vaksin', 'perawatan', 'gigi', 'laboratorium', 'tes',
        'gym', 'fitness', 'olahraga', 'yoga', 'sport', 'exercise',
        'suplemen', 'makeup', 'skincare', 'kecantikan', 'barbershop', 'salon'
    ],
    'Hiburan & Rekreasi': [
        'bioskop', 'film', 'tiket', 'konser', 'musik', 'pertunjukan',
        'hiburan', 'game', 'gaming', 'playstation', 'nintendo', 'streaming',
        'spotify', 'netflix', 'youtube', 'subscription', 'jalan-jalan',
        'liburan', 'wisata', 'hotel', 'resort', 'pantai', 'gunung'
    ],
    'Pendidikan': [
        'sekolah', 'kuliah', 'universitas', 'les', 'kursus', 'training',
        'buku', 'alat tulis', 'pelajaran', 'pendidikan', 'materi', 'pelajar',
        'siswa', 'mahasiswa', 'spp', 'biaya', 'uang sekolah', 'online course'
    ],
    'Utilitas & Tagihan': [
        'listrik', 'air', 'gas', 'internet', 'telepon', 'kuota', 'pulsa',
        'tagihan', 'bayar tagihan', 'rekening', 'cicilan', 'kontrak',
        'sewa', 'asuransi', 'pajak', 'iuran', 'ipl', 'pln', 'pam', 'telkom'
    ],
    'Gaji & Pemasukan': [
        'gaji', 'upah', 'bonus', 'komisi', 'pendapatan', 'income', 'earning',
        'cuan', 'untung', 'profit', 'bisnis', 'freelance', 'penjualan',
        'transfer', 'terima uang', 'transfer masuk', 'top up', 'isi saldo'
    ],
    'Pajak & Asuransi': [
        'pajak', 'pph', 'ppn', 'asuransi', 'premi', 'jaminan', 'asuransi',
        'kendaraan', 'kesehatan', 'jiwa', 'proteksi', 'polis', 'dana',
        'investasi', 'reksadana', 'saham', 'emas'
    ],
    'Lainnya': []
};

// Clean and normalize input
function normalizeText(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ');
}

// Extract keywords from text
function extractKeywords(text) {
    const normalized = normalizeText(text);
    return normalized.split(' ').filter(word => word.length > 2);
}

// Calculate similarity score between two strings
function calculateSimilarity(str1, str2) {
    const s1 = normalizeText(str1);
    const s2 = normalizeText(str2);
    
    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    
    // Levenshtein distance
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1;
    
    const editDistance = getEditDistance(shorter, longer);
    return (longer.length - editDistance) / longer.length;
}

// Calculate Levenshtein distance
function getEditDistance(s1, s2) {
    const costs = [];
    
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                }
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    
    return costs[s2.length];
}

// Auto-detect category from description
function detectCategory(description) {
    const normalized = normalizeText(description);
    const keywords = extractKeywords(description);
    
    let bestMatch = 'Lainnya';
    let bestScore = 0;
    const scores = {};
    
    // Check each category
    for (const [category, categoryKeywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (category === 'Lainnya') continue;
        
        let categoryScore = 0;
        
        // Check direct keyword match
        for (const keyword of categoryKeywords) {
            const keywordNormalized = normalizeText(keyword);
            
            // Exact word match (highest priority)
            if (keywords.includes(keywordNormalized)) {
                categoryScore += 1;
            }
            // Partial match
            else if (normalized.includes(keywordNormalized)) {
                categoryScore += 0.5;
            }
            // Similarity match
            else {
                const similarity = calculateSimilarity(normalized, keywordNormalized);
                if (similarity > 0.6) {
                    categoryScore += similarity * 0.3;
                }
            }
        }
        
        // Normalize score
        if (categoryKeywords.length > 0) {
            categoryScore = categoryScore / categoryKeywords.length;
        }
        
        scores[category] = categoryScore;
        
        if (categoryScore > bestScore) {
            bestScore = categoryScore;
            bestMatch = category;
        }
    }
    
    // If no good match found, return Lainnya
    if (bestScore < 0.1) {
        bestMatch = 'Lainnya';
    }
    
    return {
        category: bestMatch,
        confidence: Math.min(bestScore * 100, 100),
        alternatives: Object.entries(scores)
            .filter(([cat, _]) => cat !== bestMatch)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([cat, score]) => ({
                category: cat,
                confidence: Math.min(score * 100, 100)
            }))
    };
}

// Get suggestion text for category
function getCategorySuggestionText(description) {
    const result = detectCategory(description);
    
    if (result.confidence > 70) {
        return `✨ Kategori terdeteksi: ${result.category} (${Math.round(result.confidence)}% yakin)`;
    } else if (result.confidence > 40) {
        return `🤔 Kemungkinan: ${result.category} atau ${result.alternatives[0]?.category}`;
    } else {
        return '🤷 Sulit dideteksi, pilih kategori secara manual';
    }
}

// Initialize category input with auto-detection
function initializeCategoryInput() {
    const descriptionInput = document.getElementById('description');
    const categorySelect = document.getElementById('categorySelect');
    const aiHint = document.getElementById('aiHint');
    
    if (!descriptionInput || !categorySelect) return;
    
    descriptionInput.addEventListener('input', () => {
        const description = descriptionInput.value.trim();
        
        if (description.length > 2) {
            const result = detectCategory(description);
            // Only auto-fill if no selection made yet
            if (!categorySelect.value) {
                categorySelect.value = result.category;
            }
            
            // Show suggestion hint
            if (result.confidence > 70) {
                aiHint.textContent = `💡 AI menyarankan: ${result.category}`;
                aiHint.style.color = '#10b981';
            } else if (result.confidence > 40) {
                aiHint.textContent = `🤔 Kemungkinan: ${result.category}`;
                aiHint.style.color = '#f59e0b';
            } else {
                aiHint.textContent = '';
            }
        } else {
            if (!categorySelect.value) {
                categorySelect.value = '';
            }
            aiHint.textContent = '';
        }
    });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCategoryInput);
} else {
    initializeCategoryInput();
}
