var products = [];

// Função para adicionar um novo produto
function addProduct() {
    var productName = document.getElementById("newProductName").value;
    var productQuantity = parseInt(document.getElementById("newProductQuantity").value);
    var productImage = document.getElementById("newProductImageURL").value;

    if (productName.trim() === "" || isNaN(productQuantity) || productQuantity < 0) {
        alert("Por favor, preencha o nome e a quantidade do produto corretamente.");
        return;
    }

    var newProduct = {
        nome: productName,
        quantidade: productQuantity,
        imagem: productImage
    };

    saveProductToDatabase(newProduct); // Salvar o produto no banco de dados
}

// Função para editar um produto
function editProduct() {
    var productId = parseInt(document.getElementById("productList").value);
    var productName = document.getElementById("editProductName").value;
    var productQuantity = parseInt(document.getElementById("editProductQuantity").value);
    var productImage = document.getElementById("editProductImageURL").value;

    if (productName.trim() === "" || isNaN(productQuantity) || productQuantity < 0) {
        alert("Por favor, preencha o nome e a quantidade do produto corretamente.");
        return;
    }

    var productIndex = findProductIndexById(productId);

    if (productIndex !== -1) {
        products[productIndex].nome = productName;
        products[productIndex].quantidade = productQuantity;
        products[productIndex].imagem = productImage;

        // Atualizar a quantidade do produto no banco de dados em tempo real
        updateProductQuantityInDatabase(productId, productQuantity);

        // Atualizar a grade de produtos na interface do usuário
        updateProductGrid();

        // Limpar o formulário de edição
        clearEditProductForm();
    } else {
        alert("Produto não encontrado.");
    }
}

// Função para atualizar a quantidade do produto no banco de dados em tempo real
function updateProductQuantityInDatabase(productId, quantity) {
    fetch("database.php", {
        method: "POST",
        body: JSON.stringify({ action: "update_quantity", id: productId, quantidade: quantity }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            console.log("Quantidade do produto atualizada no banco de dados.");
        } else {
            console.error("Erro ao atualizar a quantidade do produto no banco de dados:", data.message);
        }
    })
    .catch(error => {
        console.error("Erro ao atualizar a quantidade do produto no banco de dados:", error);
    });
}

// Função para remover produtos selecionados
function removeSelectedProducts() {
    var selectedProductIds = getSelectedProductIds();

    if (selectedProductIds.length === 0) {
        alert("Selecione pelo menos um produto para remover.");
        return;
    }

    for (var i = products.length - 1; i >= 0; i--) {
        if (selectedProductIds.includes(products[i].id)) {
            products.splice(i, 1);
            removeProductFromDatabase(selectedProductIds[i]); // Remover o produto do banco de dados
        }
    }
}

// Função para aumentar a quantidade do produto
function increaseProductQuantity(productId) {
    var productIndex = findProductIndexById(productId);

    if (productIndex !== -1) {
        products[productIndex].quantidade++;
        updateProductQuantityInDatabase(productId, products[productIndex].quantidade);
        updateProductGrid();
    }
}

// Função para aumentar a quantidade do produto
function increaseProductQuantity(productId) {
    var productIndex = findProductIndexById(productId);

    if (productIndex !== -1) {
        products[productIndex].quantidade++;
        updateProductQuantityInDatabase(productId, products[productIndex].quantidade);
        updateProductGrid();
    }
}

// Função para diminuir a quantidade do produto
function decreaseProductQuantity(productId) {
    var productIndex = findProductIndexById(productId);

    if (productIndex !== -1 && products[productIndex].quantidade > 0) {
        products[productIndex].quantidade--;
        updateProductQuantityInDatabase(productId, products[productIndex].quantidade);
        updateProductGrid();
    }
}

// Função para atualizar a grade de produtos
function updateProductGrid() {
    var productGrid = document.querySelector(".product-grid");
    productGrid.innerHTML = "";

    products.forEach(function (product) {
        var productCard = document.createElement("div");
        productCard.className = "product-card";
        productCard.setAttribute("data-product-id", product.id);

        var productImage = document.createElement("img");
        productImage.src = product.imagem;
        productImage.alt = "Product Image";
        productCard.appendChild(productImage);

        var productDetails = document.createElement("div");
        productDetails.className = "product-details";
        productCard.appendChild(productDetails);

        var productName = document.createElement("div");
        productName.className = "product-name";
        productName.textContent = product.nome;
        productDetails.appendChild(productName);

        var productQuantity = document.createElement("div");
        productQuantity.className = "product-quantity";
        productQuantity.textContent = "Quantidade: " + product.quantidade;
        productDetails.appendChild(productQuantity);

        // Botões para aumentar e diminuir a quantidade do produto
        var increaseButton = document.createElement("button");
        increaseButton.className = "btn btn-success btn-sm";
        increaseButton.textContent = "+";
        increaseButton.onclick = function () {
            increaseProductQuantity(product.id);
        };
        productDetails.appendChild(increaseButton);

        var decreaseButton = document.createElement("button");
        decreaseButton.className = "btn btn-danger btn-sm ml-1";
        decreaseButton.textContent = "-";
        decreaseButton.onclick = function () {
            decreaseProductQuantity(product.id);
        };
        productDetails.appendChild(decreaseButton);

        productGrid.appendChild(productCard);
    });
}

// Função para atualizar a quantidade do produto no banco de dados
function updateProductQuantityInDatabase(productId, newQuantity) {
    fetch("database.php", {
        method: "POST",
        body: JSON.stringify({ action: "update_quantity", id: productId, quantidade: newQuantity }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            console.log("Quantidade do produto atualizada no banco de dados:", data);
        } else {
            console.error("Erro ao atualizar a quantidade do produto no banco de dados:", data.message);
        }
    })
    .catch(error => {
        console.error("Erro ao atualizar a quantidade do produto no banco de dados:", error);
    });
}


// Função para carregar os produtos do banco de dados
function loadProductsFromDatabase() {
    fetch("database.php", {
        method: "POST",
        body: JSON.stringify({ action: "get" }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        products = data;
        updateProductGrid();
    })
    .catch(error => {
        console.error("Erro ao carregar produtos do banco de dados:", error);
    });
}

// Função para salvar o produto no banco de dados
function saveProductToDatabase(product) {
    fetch("database.php", {
        method: "POST",
        body: JSON.stringify({ action: "add", product: product }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            products.push(product);
            updateProductGrid();
            clearAddProductForm();
            console.log("Produto salvo no banco de dados:", data);
        } else {
            console.error("Erro ao salvar o produto no banco de dados:", data.message);
        }
    })
    .catch(error => {
        console.error("Erro ao salvar o produto no banco de dados:", error);
    });
}

// Função para atualizar o produto no banco de dados
function updateProductInDatabase(product) {
    fetch("database.php", {
        method: "POST",
        body: JSON.stringify({ action: "update", product: product }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            updateProductGrid();
            clearEditProductForm();
            console.log("Produto atualizado no banco de dados:", data);
        } else {
            console.error("Erro ao atualizar o produto no banco de dados:", data.message);
        }
    })
    .catch(error => {
        console.error("Erro ao atualizar o produto no banco de dados:", error);
    });
}

// Função para remover o produto do banco de dados
function removeProductFromDatabase(productId) {
    fetch("database.php", {
        method: "POST",
        body: JSON.stringify({ action: "delete", id: productId }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            updateProductGrid();
            console.log("Produto removido do banco de dados:", data);
        } else {
            console.error("Erro ao remover o produto do banco de dados:", data.message);
        }
    })
    .catch(error => {
        console.error("Erro ao remover o produto do banco de dados:", error);
    });
}

// ... (outras funções já implementadas anteriormente)

// Carregar os produtos do banco de dados ao iniciar a página
loadProductsFromDatabase();
