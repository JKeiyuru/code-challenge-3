// Base URL for API
const baseUrl = 'http://localhost:3000/films';
const filmsList = document.getElementById('films');
const movieDetails = document.getElementById('movie-details');
const buyTicketBtn = document.getElementById('buy-ticket');

// Fetch the first movie details and display them
function loadFirstMovie() {
  fetch(`${baseUrl}/1`)
    .then(response => response.json())
    .then(data => displayMovieDetails(data));
}

// Fetch all movies and list them in the sidebar
function loadAllMovies() {
  fetch(baseUrl)
    .then(response => response.json())
    .then(data => {
      filmsList.innerHTML = ''; // Clear existing list
      data.forEach(film => {
        const li = document.createElement('li');
        li.className = 'film item';
        li.textContent = film.title;

        // Add sold-out class if all tickets are sold
        if (film.capacity - film.tickets_sold === 0) {
          li.classList.add('sold-out');
          li.textContent += ' (Sold Out)';
        }

        li.addEventListener('click', () => displayMovieDetails(film));
        filmsList.appendChild(li);

        // Add delete button next to each film
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteFilm(film.id, li);
        });
        li.appendChild(deleteBtn);
      });
    });
}

// Display movie details
function displayMovieDetails(film) {
  document.getElementById('poster').src = film.poster;
  document.getElementById('title').textContent = film.title;
  document.getElementById('runtime').textContent = `${film.runtime} minutes`;
  document.getElementById('film-info').textContent = film.description;
  document.getElementById('showtime').textContent = film.showtime;
  document.getElementById('ticket-num').textContent = `${film.capacity - film.tickets_sold} tickets remaining`;

  // Update Buy Ticket button state
  buyTicketBtn.disabled = (film.capacity - film.tickets_sold === 0);
  buyTicketBtn.textContent = (film.capacity - film.tickets_sold === 0) ? 'Sold Out' : 'Buy Ticket';

  // Attach buy ticket event to the button
  buyTicketBtn.onclick = () => buyTicket(film);
}

// Buy ticket functionality
function buyTicket(film) {
  if (film.capacity - film.tickets_sold > 0) {
    film.tickets_sold++;
    updateTicketsSold(film);
  }
}

// Update the number of tickets sold on the server
function updateTicketsSold(film) {
  fetch(`${baseUrl}/${film.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tickets_sold: film.tickets_sold }),
  })
    .then(response => response.json())
    .then(updatedFilm => {
      displayMovieDetails(updatedFilm);
      loadAllMovies(); // Reload the sidebar to update sold-out status
    });
}

// Delete film functionality
function deleteFilm(filmId, listItem) {
  fetch(`${baseUrl}/${filmId}`, {
    method: 'DELETE',
  })
    .then(() => {
      listItem.remove(); // Remove film from the sidebar
    })
    .catch(error => console.error('Error deleting film:', error));
}

// Load first movie and list all movies on page load
document.addEventListener('DOMContentLoaded', () => {
  loadFirstMovie();
  loadAllMovies();
});
