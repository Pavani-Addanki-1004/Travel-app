// Theme & Dark Mode
const darkToggle = document.getElementById("darkToggle");
const toggleTheme = document.getElementById("toggleTheme");
const body = document.getElementById("body");

let themeIndex = 0;
const themes = [
  { from: "from-blue-100", to: "to-green-100" },
  { from: "from-yellow-100", to: "to-orange-200" },
  { from: "from-purple-200", to: "to-pink-100" }
];

darkToggle?.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
});

toggleTheme?.addEventListener("click", () => {
  body.classList.remove(...themes.map(t => t.from), ...themes.map(t => t.to));
  const theme = themes[themeIndex % themes.length];
  body.classList.add(theme.from, theme.to);
  themeIndex++;
});

// Load Destinations
function loadDestinations() {
  const container = document.getElementById("listing");
  let data = JSON.parse(localStorage.getItem("destinations")) || [];

  const name = document.getElementById("filterName")?.value.toLowerCase() || "";
  const place = document.getElementById("filterPlace")?.value.toLowerCase() || "";
  const minPrice = parseFloat(document.getElementById("minPrice")?.value) || 0;
  const maxPrice = parseFloat(document.getElementById("maxPrice")?.value) || Infinity;
  const sort = document.getElementById("sortOption")?.value;
  const favFilter = document.getElementById("filterFavorites")?.value;

  // Save search history
  if (name || place) {
    const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    const keyword = name || place;
    if (!history.includes(keyword)) {
      history.unshift(keyword);
      if (history.length > 5) history.pop();
      localStorage.setItem("searchHistory", JSON.stringify(history));
    }
  }

  // Apply filters
  data = data.filter(dest => {
    const matchesName = dest.name.toLowerCase().includes(name);
    const matchesPlace = dest.description.toLowerCase().includes(place);
    const matchesPrice = dest.price >= minPrice && dest.price <= maxPrice;
    const matchesFav = favFilter === "favorites" ? dest.favorite : true;
    return matchesName && matchesPlace && matchesPrice && matchesFav;
  });

  // Sort
  if (sort === "priceAsc") data.sort((a, b) => a.price - b.price);
  else if (sort === "priceDesc") data.sort((a, b) => b.price - a.price);
  else if (sort === "nameAsc") data.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "nameDesc") data.sort((a, b) => b.name.localeCompare(a.name));

  // Render
  container.innerHTML = data.length === 0
    ? "<p class='text-center col-span-3 text-gray-500'>No destinations found.</p>"
    : "";

  data.forEach((dest, index) => {
    const card = document.createElement("div");
    card.className = "card bg-white rounded-lg shadow p-4 transform transition hover:scale-105";

    const stars = "⭐".repeat(dest.rating || 0);
    const map = dest.map ? `<iframe src="${dest.map}" width="100%" height="180" class="rounded my-2" allowfullscreen="" loading="lazy"></iframe>` : "";

    card.innerHTML = `
      <img src="${dest.image}" alt="${dest.name}" class="w-full h-48 object-cover rounded mb-3" />
      <h3 class="text-xl font-semibold">${dest.name}</h3>
      <p class="text-blue-600 font-bold">₹${dest.price}</p>
      <p class="text-gray-700 mt-1">${dest.description}</p>
      <p class="mt-1">📅 <strong>Available From:</strong> ${dest.date || "N/A"}</p>
      <p class="mt-1">⭐ <strong>Rating:</strong> ${stars}</p>
      ${map}
      <div class="flex justify-between items-center mt-3">
        <button onclick="toggleFavorite(${index})">${dest.favorite ? "❤️" : "🤍"}</button>
        <button onclick="deleteDestination(${index})" class="text-red-600 hover:underline">🗑 Delete</button>
      </div>
    `;
    container.appendChild(card);
  });

  showSearchHistory();
}

// Favorites
function toggleFavorite(index) {
  let data = JSON.parse(localStorage.getItem("destinations")) || [];
  data[index].favorite = !data[index].favorite;
  localStorage.setItem("destinations", JSON.stringify(data));
  loadDestinations();
}

// Delete
function deleteDestination(index) {
  let data = JSON.parse(localStorage.getItem("destinations")) || [];
  data.splice(index, 1);
  localStorage.setItem("destinations", JSON.stringify(data));
  loadDestinations();
}

// Filter listeners
document.getElementById("filterForm")?.addEventListener("input", loadDestinations);

// Search history
function showSearchHistory() {
  const historyEl = document.getElementById("searchHistory");
  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  historyEl.innerHTML = history.map(q => `<li class="bg-gray-200 px-2 py-1 rounded">${q}</li>`).join("");
}

// Toast if redirected after add
if (window.location.search.includes("added=true")) {
  const toast = document.getElementById("toast");
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

// Initial Load
window.addEventListener("DOMContentLoaded", loadDestinations);

// ===== 🔻 ADD FORM HANDLER FOR add.html 🔻 =====
document.getElementById("addForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const image = document.getElementById("image").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const description = document.getElementById("description").value.trim();
  const date = document.getElementById("date").value;
  const map = document.getElementById("map").value.trim();
  const rating = parseInt(document.querySelector('input[name="rating"]:checked')?.value);

  if (!name || !image || !description || !rating || isNaN(price)) {
    alert("Please fill all required fields correctly.");
    return;
  }

  const newDestination = {
    name,
    image,
    price,
    description,
    date,
    map,
    rating,
    favorite: false
  };

  const destinations = JSON.parse(localStorage.getItem("destinations")) || [];
  destinations.push(newDestination);
  localStorage.setItem("destinations", JSON.stringify(destinations));

  // Redirect to index with toast flag
  window.location.href = "index.html?added=true";
});
