/**
 * ═══════════════════════════════════════════════════════════════════════════
 *                    БИБЛИОТЕКА АУДИОКНИГ - JAVASCRIPT
 * 
 * Этот файл отвечает за:
 * 1. Загрузку данных из файла books.json
 * 2. Отображение карточек книг на странице
 * 3. Работу фильтров (по классу, автору, жанру)
 * 4. Обработку ошибок при загрузке
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Массив для хранения всех загруженных книг
 * Изначально пустой, заполняется после загрузки из JSON
 */
let allBooks = [];

/**
 * Ссылки на HTML-элементы для быстрого доступа
 * Получаем элементы один раз при загрузке страницы
 */
const booksGrid = document.getElementById('booksGrid');          // Контейнер для карточек
const classFilter = document.getElementById('classFilter');      // Фильтр по классу
const authorFilter = document.getElementById('authorFilter');    // Фильтр по автору
const genreFilter = document.getElementById('genreFilter');      // Фильтр по жанру
const resetBtn = document.getElementById('resetBtn');            // Кнопка сброса
const booksCount = document.getElementById('booksCount');        // Счётчик книг
const currentFiltersDiv = document.getElementById('currentFilters'); // Активные фильтры

// ─────────────────────────────────────────────────────────────────────────────
// ОСНОВНАЯ ФУНКЦИЯ ЗАГРУЗКИ СТРАНИЦЫ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Событие загрузки страницы
 * Запускает загрузку данных из JSON-файла
 */
document.addEventListener('DOMContentLoaded', function() {
    // Показываем индикатор загрузки
    showLoading();
    
    // Загружаем данные из JSON-файла
    loadBooksData();
});

// ─────────────────────────────────────────────────────────────────────────────
// ФУНКЦИЯ ЗАГРУЗКИ ДАННЫХ ИЗ JSON
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Загружает данные аудиокниг из файла books.json
 * Обрабатывает ошибки сети и формата данных
 */
async function loadBooksData() {
    try {
        // Делаем запрос к файлу books.json
        const response = await fetch('books.json');
        
        // Проверяем, успешно ли загружен файл
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.status}`);
        }
        
        // Преобразуем ответ в JSON-формат
        const data = await response.json();
        
        // Сохраняем книги в глобальную переменную
        allBooks = data;
        
        // Заполняем выпадающие списки фильтров
        populateFilters();
        
        // Отображаем все книги на странице
        displayBooks(allBooks);
        
        // Добавляем обработчики событий для фильтров
        setupEventListeners();
        
    } catch (error) {
        // Выводим ошибку в консоль для отладки
        console.error('Ошибка при загрузке данных:', error);
        
        // Показываем сообщение об ошибке пользователю
        showError('Не удалось загрузить список книг. Проверьте файл books.json');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ФУНКЦИЯ ОТОБРАЖЕНИЯ ИНДИКАТОРА ЗАГРУЗКИ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Показывает индикатор загрузки пока данные загружаются
 */
function showLoading() {
    booksGrid.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Загружаем библиотеку аудиокниг...</p>
        </div>
    `;
}

// ─────────────────────────────────────────────────────────────────────────────
// ФУНКЦИЯ ОТОБРАЖЕНИЯ ОШИБКИ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Показывает сообщение об ошибке
 * @param {string} message - Текст сообщения об ошибке
 */
function showError(message) {
    booksGrid.innerHTML = `
        <div class="error-message">
            <h3>❌ Ошибка</h3>
            <p>${message}</p>
        </div>
    `;
}

// ─────────────────────────────────────────────────────────────────────────────
// ФУНКЦИЯ ЗАПОЛНЕНИЯ ФИЛЬТРОВ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Заполняет выпадающие списки фильтров уникальными значениями
 * из загруженных данных о книгах
 */
function populateFilters() {
    // Создаём множества (Set) для хранения уникальных значений
    // Множество автоматически удаляет дубликаты
    const classes = new Set();
    const authors = new Set();
    const genres = new Set();
    
    // Проходим по всем книгам и собираем уникальные значения
    allBooks.forEach(book => {
        classes.add(book.class);      // Добавляем класс (число)
        authors.add(book.author);     // Добавляем автора
        genres.add(book.genre);       // Добавляем жанр
    });
    
    // Сортируем классы по возрастанию и добавляем в выпадающий список
    // Convert to array, sort, then iterate
    Array.from(classes).sort((a, b) => a - b).forEach(classNum => {
        const option = document.createElement('option');
        option.value = classNum;
        option.textContent = `${classNum} класс`;
        classFilter.appendChild(option);
    });
    
    // Сортируем авторов по алфавиту и добавляем в выпадающий список
    Array.from(authors).sort().forEach(author => {
        const option = document.createElement('option');
        option.value = author;
        option.textContent = author;
        authorFilter.appendChild(option);
    });
    
    // Сортируем жанры по алфавиту и добавляем в выпадающий список
    Array.from(genres).sort().forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// ФУНКЦИЯ ОТОБРАЖЕНИЯ КНИГ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Отображает карточки книг на странице
 * @param {Array} books - Массив объектов книг для отображения
 */
function displayBooks(books) {
    // Очищаем контейнер перед добавлением новых карточек
    booksGrid.innerHTML = '';
    
    // Обновляем счётчик найденных книг
    booksCount.textContent = `Найдено книг: ${books.length}`;
    
    // Если книг нет, показываем сообщение
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
    
    // Создаём карточку для каждой книги
    books.forEach(book => {
        // Создаём элемент карточки
        const card = createBookCard(book);
        // Добавляем карточку в контейнер
        booksGrid.appendChild(card);
    });
    
    // Обновляем отображение активных фильтров
    updateCurrentFilters();
}

// ─────────────────────────────────────────────────────────────────────────────
// ФУНКЦИЯ СОЗДАНИЯ КАРТОЧКИ КНИГИ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Создаёт HTML-элемент карточки книги
 * @param {Object} book - Объект с данными о книге
 * @returns {HTMLElement} - Готовый элемент карточки
 */
function createBookCard(book) {
    // Создаём контейнер карточки
    const card = document.createElement('article');
    card.className = 'book-card';
    
    // Формируем HTML-содержимое карточки
    card.innerHTML = `
        <!-- Обложка книги -->
        <div class="book-cover">
            <!-- Изображение обложки с обработкой ошибок -->
            <img 
                src="${book.coverUrl}" 
                alt="Обложка книги: ${book.title}"
                onerror="this.parentElement.innerHTML = createPlaceholder('${book.title}')"
                loading="lazy"
            >
        </div>
        
        <!-- Информация о книге -->
        <div class="book-info">
            <!-- Название книги -->
            <h3 class="book-title">${book.title}</h3>
            
            <!-- Автор книги -->
            <p class="book-author">${book.author}</p>
            
            <!-- Метаданные: класс и жанр -->
            <div class="book-meta">
                <span class="class-badge">${book.class} класс</span>
                <span class="genre-badge">${book.genre}</span>
            </div>
            
            <!-- Кнопка для перехода к аудиокниге -->
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
    
    return card;
}

// ─────────────────────────────────────────────────────────────────────────────
// ФУНКЦИЯ СОЗДАНИЯ PLACEHOLDER ИЗОБРАЖЕНИЯ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Создаёт placeholder для обложки, если изображение не загрузилось
 * @param {string} title - Название книги для отображения
 * @returns {string} - HTML-код placeholder
 */
function createPlaceholder(title) {
    // Обрезаем название до первых слов для placeholder
    const shortTitle = title.length > 30 ? title.substring(0, 30) + '...' : title;
    return `
        <div class="placeholder">
            <div class="placeholder-icon">📖</div>
            <div class="placeholder-text">${shortTitle}</div>
        </div>
    `;
}

// Делаем функцию доступной глобально для onerror
window.createPlaceholder = createPlaceholder;

// ─────────────────────────────────────────────────────────────────────────────
// ФУНКЦИЯ УСТАНОВКИ ОБРАБОТЧИКОВ СОБЫТИЙ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Добавляет обработчики событий для фильтров и кнопки сброса
 */
function setupEventListeners() {
    // При изменении фильтра по классу
    classFilter.addEventListener('change', applyFilters);
    
    // При изменении фильтра по автору
    authorFilter.addEventListener('change', applyFilters);
    
    // При изменении фильтра по жанру
    genreFilter.addEventListener('change', applyFilters);
    
    // При нажатии кнопки сброса фильтров
    resetBtn.addEventListener('click', resetFilters);
}

// ─────────────────────────────────────────────────────────────────────────────
// ФУНКЦИЯ ПРИМЕНЕНИЯ ФИЛЬТРОВ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Применяет выбранные фильтры и отображает отфильтрованные книги
 * Фильтры работают одновременно (логическое И)
 */
function applyFilters() {
    // Получаем выбранные значения из фильтров
    const selectedClass = classFilter.value;    // Выбранный класс
    const selectedAuthor = authorFilter.value;  // Выбранный автор
    const selectedGenre = genreFilter.value;    // Выбранный жанр
    
    // Фильтруем книги по всем выбранным критериям
    const filteredBooks = allBooks.filter(book => {
        // Проверяем соответствие классу (если выбран)
        const matchesClass = !selectedClass || book.class == selectedClass;
        
        // Проверяем соответствие автору (если выбран)
        const matchesAuthor = !selectedAuthor || book.author === selectedAuthor;
        
        // Проверяем соответствие жанру (если выбран)
        const matchesGenre = !selectedGenre || book.genre === selectedGenre;
        
        // Книга подходит, если соответствует ВСЕМ выбранным фильтрам
        return matchesClass && matchesAuthor && matchesGenre;
    });
    
    // Отображаем отфильтрованные книги
    displayBooks(filteredBooks);
}

// ─────────────────────────────────────────────────────────────────────────────
// ФУНКЦИЯ СБРОСА ФИЛЬТРОВ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Сбрасывает все фильтры и отображает все книги
 */
function resetFilters() {
    // Сбрасываем значения всех выпадающих списков
    classFilter.value = '';
    authorFilter.value = '';
    genreFilter.value = '';
    
    // Отображаем все книги
    displayBooks(allBooks);
}

// ─────────────────────────────────────────────────────────────────────────────
// ФУНКЦИЯ ОБНОВЛЕНИЯ ОТОБРАЖЕНИЯ АКТИВНЫХ ФИЛЬТРОВ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Обновляет панель с отображением текущих активных фильтров
 */
function updateCurrentFilters() {
    // Очищаем контейнер
    currentFiltersDiv.innerHTML = '';
    
    // Получаем выбранные значения
    const selectedClass = classFilter.value;
    const selectedAuthor = authorFilter.value;
    const selectedGenre = genreFilter.value;
    
    // Добавляем метку для выбранного класса
    if (selectedClass) {
        const tag = document.createElement('span');
        tag.className = 'filter-tag';
        tag.textContent = `📚 ${selectedClass} класс`;
        currentFiltersDiv.appendChild(tag);
    }
    
    // Добавляем метку для выбранного автора
    if (selectedAuthor) {
        const tag = document.createElement('span');
        tag.className = 'filter-tag';
        tag.textContent = `✍️ ${selectedAuthor}`;
        currentFiltersDiv.appendChild(tag);
    }
    
    // Добавляем метку для выбранного жанра
    if (selectedGenre) {
        const tag = document.createElement('span');
        tag.className = 'filter-tag';
        tag.textContent = `📖 ${selectedGenre}`;
        currentFiltersDiv.appendChild(tag);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ДОПОЛНИТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ПОИСКА ПО НАЗВАНИЮ (РАСШИРЕНИЕ)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Функция для поиска книг по названию (может быть добавлена в будущем)
 * @param {string} searchTerm - Поисковый запрос
 * @returns {Array} - Массив найденных книг
 */
function searchBooks(searchTerm) {
    // Если поисковый запрос пустой, возвращаем все книги
    if (!searchTerm.trim()) {
        return allBooks;
    }
    
    // Приводим запрос к нижнему регистру для нечувствительного поиска
    const term = searchTerm.toLowerCase();
    
    // Ищем книги, в названии или авторе которых есть поисковый запрос
    return allBooks.filter(book => {
        return book.title.toLowerCase().includes(term) || 
               book.author.toLowerCase().includes(term);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// КОНЕЦ ФАЙЛА
// ═══════════════════════════════════════════════════════════════════════════
