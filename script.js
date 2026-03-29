/**
 * ═══════════════════════════════════════════════════════════════════════════
 *                    БИБЛИОТЕКА АУДИОКНИГ - JAVASCRIPT
 *
 * Этот файл отвечает за:
 * 1. Загрузку данных из файла books.json
 * 2. Отображение карточек книг на странице
 * 3. Работу фильтров (по классу, автору, жанру)
 * 4. Поиск по названию книги
 * 5. Сортировку книг
 * 6. Тёмную тему
 * 7. Сворачивание панели фильтров
 * 8. Обработку ошибок при загрузке
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Массив для хранения всех загруженных книг
 */
let allBooks = [];

/**
 * Массив для хранения текущих отфильтрованных книг
 */
let currentBooks = [];

/**
 * Ссылки на HTML-элементы
 */
const booksGrid = document.getElementById('booksGrid');
const classFilter = document.getElementById('classFilter');
const authorFilter = document.getElementById('authorFilter');
const genreFilter = document.getElementById('genreFilter');
const sortFilter = document.getElementById('sortFilter');
const searchInput = document.getElementById('searchInput');
const resetBtn = document.getElementById('resetBtn');
const booksCount = document.getElementById('booksCount');
const currentFiltersDiv = document.getElementById('currentFilters');
const themeToggle = document.getElementById('themeToggle');
const filtersHeader = document.getElementById('filtersHeader');
const filtersContent = document.getElementById('filtersContent');
const filtersToggleIcon = document.getElementById('filtersToggleIcon');

// ─────────────────────────────────────────────────────────────────────────────
// ЗАГРУЗКА СТРАНИЦЫ
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация темы
    initTheme();
    
    // Показываем индикатор загрузки
    showLoading();

    // Загружаем данные из JSON-файла
    loadBooksData();
});

// ─────────────────────────────────────────────────────────────────────────────
// ТЁМНАЯ ТЕМА
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Инициализирует тему (загружает из localStorage или системную)
 */
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.textContent = '🌙';
    }
    
    // Обработчик переключения темы
    themeToggle.addEventListener('click', toggleTheme);
}

/**
 * Переключает тему и сохраняет выбор в localStorage
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', newTheme);
}

// ─────────────────────────────────────────────────────────────────────────────
// ЗАГРУЗКА ДАННЫХ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Загружает данные аудиокниг из файла books.json
 */
async function loadBooksData() {
    try {
        const response = await fetch('books.json');

        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.status}`);
        }

        const data = await response.json();
        allBooks = data;

        populateFilters();
        applyFilters();
        setupEventListeners();
        setupFiltersToggle();

    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        showError('Не удалось загрузить список книг. Проверьте файл books.json');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ИНДИКАТОР ЗАГРУЗКИ И ОШИБКИ
// ─────────────────────────────────────────────────────────────────────────────

function showLoading() {
    booksGrid.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Загружаем библиотеку аудиокниг...</p>
        </div>
    `;
}

function showError(message) {
    booksGrid.innerHTML = `
        <div class="error-message">
            <h3>❌ Ошибка</h3>
            <p>${message}</p>
        </div>
    `;
}

// ─────────────────────────────────────────────────────────────────────────────
// ЗАПОЛНЕНИЕ ФИЛЬТРОВ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Заполняет выпадающие списки фильтров уникальными значениями
 */
function populateFilters() {
    const classes = new Set();
    const authors = new Set();
    const genres = new Set();

    allBooks.forEach(book => {
        classes.add(book.class);
        authors.add(book.author);
        genres.add(book.genre);
    });

    // Сортируем классы по возрастанию
    Array.from(classes).sort((a, b) => a - b).forEach(classNum => {
        const option = document.createElement('option');
        option.value = classNum;
        option.textContent = `${classNum} класс`;
        classFilter.appendChild(option);
    });

    // Сортируем авторов по алфавиту
    Array.from(authors).sort().forEach(author => {
        const option = document.createElement('option');
        option.value = author;
        option.textContent = author;
        authorFilter.appendChild(option);
    });

    // Сортируем жанры по алфавиту
    Array.from(genres).sort().forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// ОТОБРАЖЕНИЕ КНИГ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Отображает карточки книг на странице
 */
function displayBooks(books) {
    booksGrid.innerHTML = '';
    booksCount.textContent = `Найдено книг: ${books.length}`;

    if (books.length === 0) {
        booksGrid.innerHTML = `
            <div class="no-books">
                <div class="no-books-icon">📚</div>
                <h3>Книги не найдены</h3>
                <p>Попробуйте изменить параметры фильтрации</p>
            </div>
        `;
        return;
    }

    books.forEach(book => {
        const card = createBookCard(book);
        booksGrid.appendChild(card);
    });

    updateCurrentFilters();
}

/**
 * Создаёт HTML-элемент карточки книги
 */
function createBookCard(book) {
    const card = document.createElement('article');
    card.className = 'book-card';

    card.innerHTML = `
        <div class="book-cover">
            <img
                src="${book.coverUrl}"
                alt="Обложка книги: ${book.title}"
                onerror="this.parentElement.innerHTML = window.createPlaceholder('${book.title.replace(/'/g, "\\'")}')"
                onload="this.classList.add('loaded')"
                loading="lazy"
                decoding="async"
            >
        </div>

        <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">${book.author}</p>

            <div class="book-meta">
                <span class="class-badge">${book.class} класс</span>
                <span class="genre-badge">${book.genre}</span>
            </div>

            <a
                href="${book.audioUrl}"
                class="listen-btn"
                target="_blank"
                rel="noopener noreferrer"
                title="Открыть аудиокнигу в новой вкладке"
            >
                Слушать
            </a>
        </div>
    `;

    // Добавляем fetchpriority="high" для первых 4 карточек (above the fold)
    const img = card.querySelector('img');
    if (booksGrid.children.length < 4) {
        img.setAttribute('fetchpriority', 'high');
    }

    return card;
}

/**
 * Создаёт placeholder для обложки, если изображение не загрузилось
 */
function createPlaceholder(title) {
    const shortTitle = title.length > 30 ? title.substring(0, 30) + '...' : title;
    return `
        <div class="placeholder">
            <div class="placeholder-icon">📖</div>
            <div class="placeholder-text">${shortTitle}</div>
        </div>
    `;
}

window.createPlaceholder = createPlaceholder;

// ─────────────────────────────────────────────────────────────────────────────
// ОБРАБОТЧИКИ СОБЫТИЙ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Добавляет обработчики событий для фильтров и кнопки сброса
 */
function setupEventListeners() {
    classFilter.addEventListener('change', applyFilters);
    authorFilter.addEventListener('change', applyFilters);
    genreFilter.addEventListener('change', applyFilters);
    sortFilter.addEventListener('change', applyFilters);
    resetBtn.addEventListener('click', resetFilters);
    
    // Поиск с debounce (задержка 300мс)
    let debounceTimer;
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(applyFilters, 300);
    });
}

/**
 * Сворачивание/разворачивание фильтров
 */
function setupFiltersToggle() {
    filtersHeader.addEventListener('click', function() {
        const isCollapsed = filtersContent.classList.toggle('collapsed');
        filtersHeader.classList.toggle('collapsed', isCollapsed);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// ПРИМЕНЕНИЕ ФИЛЬТРОВ И СОРТИРОВКИ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Применяет все фильтры и сортировку, отображает результат
 */
function applyFilters() {
    const selectedClass = classFilter.value;
    const selectedAuthor = authorFilter.value;
    const selectedGenre = genreFilter.value;
    const searchTerm = searchInput.value.trim().toLowerCase();
    const sortOption = sortFilter.value;

    // Фильтрация
    let filteredBooks = allBooks.filter(book => {
        const matchesClass = !selectedClass || book.class == selectedClass;
        const matchesAuthor = !selectedAuthor || book.author === selectedAuthor;
        const matchesGenre = !selectedGenre || book.genre === selectedGenre;
        const matchesSearch = !searchTerm || 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm);

        return matchesClass && matchesAuthor && matchesGenre && matchesSearch;
    });

    // Сортировка
    filteredBooks = sortBooks(filteredBooks, sortOption);

    currentBooks = filteredBooks;
    displayBooks(filteredBooks);
}

/**
 * Сортирует книги по выбранному критерию
 */
function sortBooks(books, option) {
    const sorted = [...books];
    
    switch (option) {
        case 'title-asc':
            sorted.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
            break;
        case 'title-desc':
            sorted.sort((a, b) => b.title.localeCompare(a.title, 'ru'));
            break;
        case 'author-asc':
            sorted.sort((a, b) => a.author.localeCompare(b.author, 'ru'));
            break;
        case 'author-desc':
            sorted.sort((a, b) => b.author.localeCompare(a.author, 'ru'));
            break;
        case 'class-asc':
            sorted.sort((a, b) => a.class - b.class);
            break;
        case 'class-desc':
            sorted.sort((a, b) => b.class - a.class);
            break;
        default:
            // По умолчанию - порядок из JSON
            break;
    }
    
    return sorted;
}

// ─────────────────────────────────────────────────────────────────────────────
// СБРОС ФИЛЬТРОВ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Сбрасывает все фильтры и отображает все книги
 */
function resetFilters() {
    classFilter.value = '';
    authorFilter.value = '';
    genreFilter.value = '';
    sortFilter.value = 'default';
    searchInput.value = '';

    displayBooks(allBooks);
}

// ─────────────────────────────────────────────────────────────────────────────
// ОТОБРАЖЕНИЕ АКТИВНЫХ ФИЛЬТРОВ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Обновляет панель с отображением текущих активных фильтров
 */
function updateCurrentFilters() {
    currentFiltersDiv.innerHTML = '';

    const selectedClass = classFilter.value;
    const selectedAuthor = authorFilter.value;
    const selectedGenre = genreFilter.value;
    const searchTerm = searchInput.value.trim();

    if (selectedClass) {
        const tag = createFilterTag(`📚 ${selectedClass} класс`, () => {
            classFilter.value = '';
            applyFilters();
        });
        currentFiltersDiv.appendChild(tag);
    }

    if (selectedAuthor) {
        const tag = createFilterTag(`✍️ ${selectedAuthor}`, () => {
            authorFilter.value = '';
            applyFilters();
        });
        currentFiltersDiv.appendChild(tag);
    }

    if (selectedGenre) {
        const tag = createFilterTag(`📖 ${selectedGenre}`, () => {
            genreFilter.value = '';
            applyFilters();
        });
        currentFiltersDiv.appendChild(tag);
    }

    if (searchTerm) {
        const tag = createFilterTag(`🔍 "${searchTerm}"`, () => {
            searchInput.value = '';
            applyFilters();
        });
        currentFiltersDiv.appendChild(tag);
    }
}

/**
 * Создаёт метку активного фильтра с кнопкой удаления
 */
function createFilterTag(text, onRemove) {
    const tag = document.createElement('span');
    tag.className = 'filter-tag';
    tag.innerHTML = `${text}<button type="button" aria-label="Удалить фильтр">×</button>`;
    tag.querySelector('button').addEventListener('click', onRemove);
    return tag;
}

// ═══════════════════════════════════════════════════════════════════════════
// КОНЕЦ ФАЙЛА
// ═══════════════════════════════════════════════════════════════════════════
