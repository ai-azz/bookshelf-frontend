const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF-APPS'

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('bookForm');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    const yearInput = document.getElementById('bookFormYear');
    yearInput.addEventListener('input', function () {
        if (yearInput.value.length > 4) {
            yearInput.value = yearInput.value.slice(0, 4);
        }
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function addBook() {
    const title = document.getElementById('bookFormTitle').value.trim();
    const author = document.getElementById('bookFormAuthor').value.trim();
    const year = parseInt(document.getElementById('bookFormYear').value);
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    document.getElementById('bookForm').reset();
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete,
    };
}

function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;
    textTitle.setAttribute('data-testid', 'bookItemTitle');

    const textAuthor = document.createElement('p');
    textAuthor.innerText = `Penulis: ${bookObject.author}`;
    textAuthor.setAttribute('data-testid', 'bookItemAuthor');

    const textYear = document.createElement('p');
    textYear.innerText = `Tahun: ${bookObject.year}`;
    textYear.setAttribute('data-testid', 'bookItemYear');

    const container = document.createElement('div');
    container.setAttribute('data-bookid', bookObject.id);
    container.setAttribute('data-testid', 'bookItem');

    const isCompleteButton = document.createElement('button');
    isCompleteButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    isCompleteButton.innerText = bookObject.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
    isCompleteButton.addEventListener('click', function () {
        if (bookObject.isComplete) {
            addBookToUnread(bookObject.id);
        } else {
            addBookToRead(bookObject.id);
        }
    });

    const deleteButton = document.createElement('button');
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.innerText = 'Hapus Buku';
    deleteButton.addEventListener('click', function () {
        removeBook(bookObject.id);
    });

    const editButton = document.createElement('button');
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.innerText = 'Edit Buku';
    editButton.addEventListener('click', function () {
        editBook(bookObject.id);
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.appendChild(isCompleteButton);
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(editButton);

    container.append(textTitle, textAuthor, textYear, buttonContainer);
    return container;
}

document.addEventListener(RENDER_EVENT, function () {
    const bookUnread = document.getElementById('incompleteBookList')
    const bookRead = document.getElementById('completeBookList') 

    bookUnread.innerHTML = '';
    bookRead.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete) {
            bookUnread.appendChild(bookElement);
        } else {
            bookRead.appendChild(bookElement);
        }
    }
});

function addBookToRead (bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addBookToUnread (bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBook (bookid) {
    const bookIndex = findBookIndex(bookid);

    if (bookIndex === -1) return;

    books.splice(bookIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function editBook(bookId) {
    const book = findBook(bookId);

    if (book) {
        document.getElementById('editBookTitle').value = book.title;
        document.getElementById('editBookAuthor').value = book.author;
        document.getElementById('editBookYear').value = book.year;

        const editBookForm = document.getElementById('editBookForm');
        editBookForm.dataset.bookid = bookId;

        document.getElementById('editBookPopup').style.display = 'flex';
    }
}

document.getElementById('cancelEditButton').addEventListener('click', function (){
    document.getElementById('editBookPopup').style.display = 'none';
});

document.getElementById('editBookForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const bookId = parseInt(event.target.dataset.bookid);
    const book = findBook(bookId);

    if (book) {
        book.title = document.getElementById('editBookTitle').value.trim();
        book.author = document.getElementById('editBookAuthor').value.trim();
        book.year = parseInt(document.getElementById('editBookYear').value);

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();

        document.getElementById('editBookPopup').style.display = 'none';
    }
});

function findBook (bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }

    return null;
}

function findBookIndex (bookId) {
    for (let i = 0; i < books.length; i++) {
        if (books[i].id === bookId) {
            return i;
        }
    }

    return -1;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed),
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function() {
    showToast("Data berhasil disimpan!");
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("hide");
    }, 1000);

    toast.addEventListener('transitionend', () => {
        if (toast.classList.contains('hide')) {
            toast.remove();
        }
    })
}

document.getElementById('searchBook').addEventListener('submit', function (event) {
    event.preventDefault();
    searchBook();
});

function searchBook() {
    const searchTitle = document.getElementById('searchBookTitle').value.trim().toLowerCase();
    const filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchTitle));

    renderFilteredBooks(filteredBooks);
}

function renderFilteredBooks(filteredBooks) {
    const bookUnread = document.getElementById('incompleteBookList');
    const bookRead = document.getElementById('completeBookList');

    bookUnread.innerHTML = '';
    bookRead.innerHTML = '';

    for (const bookItem of filteredBooks) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete) {
            bookUnread.appendChild(bookElement);
        } else {
            bookRead.appendChild(bookElement);
        }
    }
}