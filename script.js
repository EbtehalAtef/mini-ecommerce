let allProducts = [];
let shownProducts = [];
let cart = [];
let page = 1;
const perPage = 6;

async function start() {
  const productsResponse = await fetch("https://fakestoreapi.com/products");
  allProducts = await productsResponse.json();
  const categoriesResponse = await fetch(
    "https://fakestoreapi.com/products/categories",
  );
  const categories = await categoriesResponse.json();
  const categorySelect = document.getElementById("category");
  categorySelect.innerHTML = '<option value="all">All Categories</option>';

  for (let i = 0; i < categories.length; i++) {
    categorySelect.innerHTML +=
      '<option value="' + categories[i] + '">' + categories[i] + "</option>";
  }

  let savedSettings = localStorage.getItem("settings");
  if (savedSettings) {
    savedSettings = JSON.parse(savedSettings);
    document.getElementById("search").value = savedSettings.search || "";
    document.getElementById("category").value = savedSettings.category || "all";
    document.getElementById("minPrice").value = savedSettings.min || "";
    document.getElementById("maxPrice").value = savedSettings.max || "";
    document.getElementById("sort").value = savedSettings.sort || "none";

    if (document.getElementById("category").value == "") {
      document.getElementById("category").value = "all";
    }
    page = savedSettings.page || 1;
  }
  applyFilters();
}

function saveSettings() {
  localStorage.setItem(
    "settings",
    JSON.stringify({
      search: document.getElementById("search").value,
      category: document.getElementById("category").value,
      min: document.getElementById("minPrice").value,
      max: document.getElementById("maxPrice").value,
      sort: document.getElementById("sort").value,
      page: page,
    }),
  );
}

function applyFilters() {
  const searchText = document.getElementById("search").value.toLowerCase();
  const selectedCategory = document.getElementById("category").value;
  const minPrice = document.getElementById("minPrice").value;
  const maxPrice = document.getElementById("maxPrice").value;
  const sortOption = document.getElementById("sort").value;
  shownProducts = [];

  for (let i = 0; i < allProducts.length; i++) {
    const product = allProducts[i];
    let matches = true;
    if (
      searchText != "" &&
      product.title.toLowerCase().indexOf(searchText) == -1
    ) {
      matches = false;
    }
    if (selectedCategory != "all" && product.category != selectedCategory) {
      matches = false;
    }
    if (minPrice != "" && product.price < Number(minPrice)) {
      matches = false;
    }

    if (maxPrice != "" && product.price > Number(maxPrice)) {
      matches = false;
    }
    if (matches) {
      shownProducts.push(product);
    }
  }

  if (sortOption == "name-asc") {
    shownProducts.sort(function (a, b) {
      if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
      if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
      return 0;
    });
  }
  if (sortOption == "name-desc") {
    shownProducts.sort(function (a, b) {
      if (a.title.toLowerCase() > b.title.toLowerCase()) return -1;
      if (a.title.toLowerCase() < b.title.toLowerCase()) return 1;
      return 0;
    });
  }

  if (sortOption == "price-asc") {
    shownProducts.sort(function (a, b) {
      return a.price - b.price;
    });
  }
  if (sortOption == "price-desc") {
    shownProducts.sort(function (a, b) {
      return b.price - a.price;
    });
  }

  if (sortOption == "rating-desc") {
    shownProducts.sort(function (a, b) {
      return b.rating.rate - a.rating.rate;
    });
  }
  if (sortOption == "rating-asc") {
    shownProducts.sort(function (a, b) {
      return a.rating.rate - b.rating.rate;
    });
  }
  const totalPages = Math.ceil(shownProducts.length / perPage);
  if (page > totalPages || page < 1) {
    page = 1;
  }
  saveSettings();
  showProducts();
}

function showProducts() {
  const productsBox = document.getElementById("products");
  productsBox.innerHTML = "";
  if (shownProducts.length == 0) {
    productsBox.innerHTML = "<p class='no-result'>No results found</p>";
    showPages();
    return;
  }

  const firstIndex = (page - 1) * perPage;
  const lastIndex = firstIndex + perPage;
  for (let i = firstIndex; i < lastIndex; i++) {
    if (i >= shownProducts.length) break;
    const product = shownProducts[i];
    let html = "<div class='card'>";
    html += "<img src='" + product.image + "'>";
    html += "<h4>" + product.title + "</h4>";
    html += "<p>$" + product.price + "</p>";
    html +=
      "<button class='blue-btn' onclick='viewDetails(" +
      product.id +
      ")'>View Details</button>";
    html +=
      "<button class='blue-btn' onclick='addToCart(" +
      product.id +
      ")'>Add to Cart</button>";
    html += "</div>";
    productsBox.innerHTML += html;
  }
  showPages();
}

function showPages() {
  const pagesDiv = document.getElementById("pages");
  pagesDiv.innerHTML = "";
  const totalPages = Math.ceil(shownProducts.length / perPage);

  for (let i = 1; i <= totalPages; i++) {
    let pageClass = "";
    if (i == page) {
      pageClass = "active";
    }
    pagesDiv.innerHTML +=
      "<button class='" +
      pageClass +
      "' onclick='goToPage(" +
      i +
      ")'>" +
      i +
      "</button>";
  }
}

function goToPage(pageNumber) {
  page = pageNumber;
  saveSettings();
  showProducts();
  window.scrollTo(0, 0);
}

function addToCart(productId) {
  let foundProduct = false;

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id == productId) {
      cart[i].quantity = cart[i].quantity + 1;
      foundProduct = true;
      break;
    }
  }
  if (foundProduct == false) {
    for (let i = 0; i < allProducts.length; i++) {
      if (allProducts[i].id == productId) {
        cart.push({
          id: productId,
          title: allProducts[i].title,
          price: allProducts[i].price,
          quantity: 1,
        });
        break;
      }
    }
  }
  showCart();
}

function removeFromCart(productId) {
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id == productId) {
      cart.splice(i, 1);
      break;
    }
  }
  showCart();
}

function showCart() {
  const cartList = document.getElementById("cartList");
  cartList.innerHTML = "";
  let totalQuantity = 0;
  let totalPrice = 0;
  for (let i = 0; i < cart.length; i++) {
    const cartItem = cart[i];
    cartList.innerHTML +=
      "<li>" +
      cartItem.title +
      " - $" +
      cartItem.price +
      " " +
      cartItem.quantity +
      " <button onclick='removeFromCart(" +
      cartItem.id +
      ")'>Remove</button></li>";
    totalQuantity = totalQuantity + cartItem.quantity;
    totalPrice = totalPrice + cartItem.price * cartItem.quantity;
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  document.getElementById("totalQuantity").innerHTML = totalQuantity;
  document.getElementById("totalPrice").innerHTML = totalPrice.toFixed(2);
}

function viewDetails(productId) {
  for (let i = 0; i < allProducts.length; i++) {
    if (allProducts[i].id == productId) {
      const product = allProducts[i];

      document.getElementById("detailsImage").src = product.image;
      document.getElementById("detailsTitle").innerHTML = product.title;
      document.getElementById("detailsCategory").innerHTML =
        "Category: " + product.category;
      document.getElementById("detailsDescription").innerHTML =
        product.description;
      document.getElementById("detailsPrice").innerHTML =
        "Price: $" + product.price;
      document.getElementById("detailsRating").innerHTML =
        "Rating: " +
        product.rating.rate +
        " (" +
        product.rating.count +
        " reviews)";
      document.getElementById("details").style.display = "flex";
      break;
    }
  }
}

document.getElementById("closeBtn").onclick = function () {
  document.getElementById("details").style.display = "none";
};
document.getElementById("applyBtn").onclick = function () {
  page = 1;
  applyFilters();
};
document.getElementById("sort").onchange = function () {
  page = 1;
  applyFilters();
};
if (localStorage.getItem("cart")) {
  cart = JSON.parse(localStorage.getItem("cart"));
  showCart();
}
start();
