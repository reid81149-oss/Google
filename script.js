// Browser State
let browserId = Math.random().toString(36).substr(2, 9);
let history = [];
let historyIndex = -1;
let bookmarks = [];

// DOM Elements
const addressBar = document.getElementById('addressBar');
const browserFrame = document.getElementById('browserFrame');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');
const refreshBtn = document.getElementById('refreshBtn');
const bookmarkBtn = document.getElementById('bookmarkBtn');
const bookmarksList = document.getElementById('bookmarksList');
const clearBookmarksBtn = document.getElementById('clearBookmarksBtn');
const loadingScreen = document.getElementById('loadingScreen');
const errorScreen = document.getElementById('errorScreen');
const errorMessage = document.getElementById('errorMessage');
const currentUrlDisplay = document.getElementById('currentUrl');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBookmarks();
    setupEventListeners();
    renderBookmarks();
});

// Event Listeners
function setupEventListeners() {
    addressBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            navigateToUrl(addressBar.value);
        }
    });

    backBtn.addEventListener('click', goBack);
    forwardBtn.addEventListener('click', goForward);
    refreshBtn.addEventListener('click', refreshPage);
    bookmarkBtn.addEventListener('click', toggleBookmark);
    clearBookmarksBtn.addEventListener('click', clearAllBookmarks);

    // Update bookmark button when URL changes
    browserFrame.addEventListener('load', () => {
        hideLoadingScreen();
        updateBookmarkButton();
        updateNavigationButtons();
    });

    browserFrame.addEventListener('error', () => {
        showErrorScreen('Failed to load the page. Please check the URL and try again.');
    });

    // Show loading screen on page load start
    browserFrame.addEventListener('loadstart', showLoadingScreen);
}

// Navigation Functions
function navigateToUrl(url) {
    if (!url.trim()) {
        return;
    }

    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (url.includes('.')) {
            url = 'https://' + url;
        } else {
            url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
        }
    }

    // Add to history
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    history.push(url);
    historyIndex = history.length - 1;

    loadPage(url);
    updateNavigationButtons();
}

function loadPage(url) {
    try {
        showLoadingScreen();
        errorScreen.style.display = 'none';
        browserFrame.classList.add('active');
        browserFrame.src = url;
        addressBar.value = url;
        currentUrlDisplay.textContent = url;
    } catch (error) {
        showErrorScreen('Unable to load this page: ' + error.message);
    }
}

function goBack() {
    if (historyIndex > 0) {
        historyIndex--;
        loadPage(history[historyIndex]);
        updateNavigationButtons();
    }
}

function goForward() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        loadPage(history[historyIndex]);
        updateNavigationButtons();
    }
}

function refreshPage() {
    if (browserFrame.src) {
        browserFrame.src = browserFrame.src;
        showLoadingScreen();
    }
}

function updateNavigationButtons() {
    backBtn.disabled = historyIndex <= 0;
    forwardBtn.disabled = historyIndex >= history.length - 1;
    backBtn.style.opacity = historyIndex <= 0 ? '0.5' : '1';
    forwardBtn.style.opacity = historyIndex >= history.length - 1 ? '0.5' : '1';
}

// Bookmark Functions
function toggleBookmark() {
    const currentUrl = addressBar.value.trim();
    if (!currentUrl) return;

    const index = bookmarks.findIndex(b => b.url === currentUrl);
    
    if (index > -1) {
        bookmarks.splice(index, 1);
    } else {
        try {
            const urlObj = new URL(currentUrl);
            const title = urlObj.hostname || currentUrl;
            bookmarks.push({ url: currentUrl, title, date: new Date().toISOString() });
        } catch (e) {
            bookmarks.push({ url: currentUrl, title: currentUrl, date: new Date().toISOString() });
        }
    }

    saveBookmarks();
    renderBookmarks();
    updateBookmarkButton();
}

function updateBookmarkButton() {
    const currentUrl = addressBar.value.trim();
    const isBookmarked = bookmarks.some(b => b.url === currentUrl);
    
    if (isBookmarked) {
        bookmarkBtn.classList.add('bookmarked');
        bookmarkBtn.innerHTML = '<span class="icon">★</span>';
    } else {
        bookmarkBtn.classList.remove('bookmarked');
        bookmarkBtn.innerHTML = '<span class="icon">☆</span>';
    }
}

function renderBookmarks() {
    bookmarksList.innerHTML = '';
    
    bookmarks.forEach(bookmark => {
        const bookmarkDiv = document.createElement('div');
        bookmarkDiv.className = 'bookmark-item';
        bookmarkDiv.innerHTML = `
            <span style="max-width: 150px; overflow: hidden; text-overflow: ellipsis;">${bookmark.title}</span>
            <button class="remove-btn" onclick="removeBookmark('${bookmark.url}')">✕</button>
        `;
        bookmarkDiv.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-btn')) {
                navigateToUrl(bookmark.url);
            }
        });
        bookmarksList.appendChild(bookmarkDiv);
    });

    // Show/hide bookmarks bar based on content
    const bookmarksBar = document.querySelector('.bookmarks-bar');
    if (bookmarks.length === 0) {
        bookmarksBar.style.display = 'none';
    } else {
        bookmarksBar.style.display = 'flex';
    }
}

function removeBookmark(url) {
    bookmarks = bookmarks.filter(b => b.url !== url);
    saveBookmarks();
    renderBookmarks();
    updateBookmarkButton();
}

function clearAllBookmarks() {
    if (confirm('Are you sure you want to clear all bookmarks?')) {
        bookmarks = [];
        saveBookmarks();
        renderBookmarks();
        updateBookmarkButton();
    }
}

// Local Storage
function saveBookmarks() {
    localStorage.setItem('google-browser-bookmarks', JSON.stringify(bookmarks));
}

function loadBookmarks() {
    const saved = localStorage.getItem('google-browser-bookmarks');
    if (saved) {
        try {
            bookmarks = JSON.parse(saved);
        } catch (e) {
            bookmarks = [];
        }
    }
}

// UI Functions
function showLoadingScreen() {
    loadingScreen.classList.remove('hidden');
    errorScreen.style.display = 'none';
}

function hideLoadingScreen() {
    loadingScreen.classList.add('hidden');
}

function showErrorScreen(message) {
    hideLoadingScreen();
    errorScreen.style.display = 'flex';
    errorMessage.textContent = message;
    browserFrame.classList.remove('active');
}

// Welcome Screen (optional - load Google on start)
window.addEventListener('load', () => {
    // Uncomment to load Google by default
    // navigateToUrl('https://www.google.com');
});
