const books = [];
const RENDER_EVENT = 'render-book';

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
});

function addBook() {
    const title = document.getElementById('bookFormTitle').value.trim();
    const author = document.getElementById('bookFormAuthor').value.trim();
    const year = document.getElementById('bookFormYear').value;
    const isCompleted = document.getElementById('bookFormIsComplete').checked;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, title, author, year, isCompleted);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    document.getElementById('bookForm').reset();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted,
    };
}

document.addEventListener(RENDER_EVENT, function () {
    console.log(books);
});