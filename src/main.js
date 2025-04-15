const searchInput = document.querySelector("#searchInput");
const searchButton = document.querySelector("#searchButton");
const resultsContainer = document.querySelector("#results");
const bookModal = document.querySelector("#bookModal");
const closeModal = document.querySelector("#closeModal");
const modalCover = document.querySelector("#modalCover");
const modalTitle = document.querySelector("#modalTitle");
const modalAuthor = document.querySelector("#modalAuthor");
const modalYear = document.querySelector("#modalYear");
const modalDescription = document.querySelector("#modalDescription");
const darkModeToggle = document.querySelector("#darkModeToggle");
const readingListContainer = document.querySelector("#readingListContainer");

searchButton.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  if (!query) {
    resultsContainer.innerHTML = "<p>Please enter a search term.</p>";
    return;
  }

  resultsContainer.innerHTML = "<p>Loading...</p>";
  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();

    if (data.docs.length === 0) {
      resultsContainer.innerHTML = "<p>No results found.</p>";
      return;
    }

    resultsContainer.innerHTML = data.docs
      .slice(0, 10)
      .map(
        (book, index) => `
          <div class="book" data-index="${index}">
            <img 
              src="https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" 
              alt="${book.title} cover" 
              onerror="this.src='https://via.placeholder.com/128x193?text=No+Cover';"
            />
            <div>
              <h2>${book.title}</h2>
              <p>Author: ${
                book.author_name ? book.author_name.join(", ") : "Unknown"
              }</p>
              <p>First Published: ${book.first_publish_year || "N/A"}</p>
              <select class="readingListDropdown">
                <option value="">Add to Reading List</option>
                <option value="Want to Read">Want to Read</option>
                <option value="Currently Reading">Currently Reading</option>
                <option value="Already Read">Already Read</option>
              </select>
            </div>
          </div>
        `
      )
      .join("");

    const books = document.querySelectorAll(".book");
    books.forEach((book, index) => {
      const dropdown = book.querySelector(".readingListDropdown");
      dropdown.addEventListener("change", (event) => {
        const category = event.target.value;
        if (category) {
          const selectedBook = data.docs[index];
          addToReadingList(
            {
              title: selectedBook.title,
              author: selectedBook.author_name
                ? selectedBook.author_name.join(", ")
                : "Unknown",
              year: selectedBook.first_publish_year || "N/A",
              cover: `https://covers.openlibrary.org/b/id/${selectedBook.cover_i}-M.jpg`,
            },
            category
          );
        }
      });

      book.addEventListener("click", () => {
        const selectedBook = data.docs[index];
        openModal(selectedBook);
      });
    });
  } catch (error) {
    resultsContainer.innerHTML =
      "<p>Failed to fetch books. Please try again later.</p>";
    console.error(error);
  }
});

function openModal(book) {
  modalCover.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
  modalCover.alt = `${book.title} cover`;
  modalTitle.textContent = book.title;
  modalAuthor.textContent = `Author: ${
    book.author_name ? book.author_name.join(", ") : "Unknown"
  }`;
  modalYear.textContent = `First Published: ${
    book.first_publish_year || "N/A"
  }`;
  modalDescription.textContent = `Description: ${
    book.description || "No description available."
  }`;
  bookModal.classList.remove("hidden");
}

// Close modal when clicking the "X" icon
closeModal.addEventListener("click", () => {
  bookModal.classList.add("hidden");
});

// Close modal when clicking anywhere on the dim background
bookModal.addEventListener("click", (event) => {
  if (event.target === bookModal) {
    bookModal.classList.add("hidden");
  }
});

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  darkModeToggle.textContent = isDarkMode ? "Light Mode" : "Dark Mode";
});

function updateReadingList() {
  const readingList = JSON.parse(localStorage.getItem("readingList")) || [];
  readingListContainer.innerHTML = readingList
    .map(
      (book, index) => `
      <div class="book">
        <img 
          src="${book.cover}" 
          alt="${book.title} cover" 
          onerror="this.src='https://via.placeholder.com/128x193?text=No+Cover';"
        />
        <div>
          <h2>${book.title}</h2>
          <p>Author: ${book.author}</p>
          <p>First Published: ${book.year}</p>
          <p>Category: ${book.category}</p>
          <button class="deleteButton" data-index="${index}">Remove</button>
        </div>
      </div>
    `
    )
    .join("");

  const deleteButtons = document.querySelectorAll(".deleteButton");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const index = event.target.dataset.index;
      removeFromReadingList(index);
    });
  });
}

function addToReadingList(book, category) {
  let readingList = JSON.parse(localStorage.getItem("readingList")) || [];
  const existingBookIndex = readingList.findIndex(
    (item) => item.title === book.title && item.author === book.author
  );

  if (existingBookIndex !== -1) {
    // Update the category if the book already exists
    readingList[existingBookIndex].category = category;
  } else {
    // Add the book to the list if it doesn't exist
    readingList.push({ ...book, category });
  }

  localStorage.setItem("readingList", JSON.stringify(readingList));
  updateReadingList();
}

function removeFromReadingList(index) {
  let readingList = JSON.parse(localStorage.getItem("readingList")) || [];
  readingList.splice(index, 1);
  localStorage.setItem("readingList", JSON.stringify(readingList));
  updateReadingList();
}

// Initialize the reading list on page load
updateReadingList();
