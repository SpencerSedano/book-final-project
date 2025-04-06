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
            </div>
          </div>
        `
      )
      .join("");

    const books = document.querySelectorAll(".book");
    books.forEach((book, index) => {
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

closeModal.addEventListener("click", () => {
  bookModal.classList.add("hidden");
});
