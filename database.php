<?php
$servername = "localhost";
$username = "root";
$password = ""; // Coloque a senha do seu banco de dados, se houver
$dbname = "loja";

// Conectar ao banco de dados
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar a conexão
if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
}

// Definir o cabeçalho para permitir o acesso à API de diferentes origens
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Ler os dados enviados via método POST
$data = json_decode(file_get_contents("php://input"), true);

// Verificar se há uma ação especificada
if (isset($data["action"])) {
    $action = $data["action"];

    if ($action === "add") {
        // Adicionar o produto ao banco de dados
        $product = $data["product"];
        $nome = $product["nome"];
        $quantidade = $product["quantidade"];
        $imagem = $product["imagem"];

        // Verificar se já existe um produto com o mesmo nome no banco de dados
        $sqlCheck = "SELECT * FROM produtos WHERE nome='$nome'";
        $resultCheck = $conn->query($sqlCheck);
        if ($resultCheck->num_rows > 0) {
            echo json_encode(array("status" => "error", "message" => "Já existe um produto com esse nome."));
            exit();
        }

        $sql = "INSERT INTO produtos (nome, quantidade, imagem) VALUES ('$nome', $quantidade, '$imagem')";

        if ($conn->query($sql) === true) {
            $productId = $conn->insert_id;
            $product["id"] = $productId;
            echo json_encode(array("status" => "success", "product" => $product));
        } else {
            echo json_encode(array("status" => "error", "message" => $conn->error));
        }
    } elseif ($action === "update") {
        // Atualizar o produto no banco de dados
        $product = $data["product"];
        $id = $product["id"];
        $nome = $product["nome"];
        $imagem = $product["imagem"];

        // Verificar se já existe outro produto com o mesmo nome no banco de dados
        $sqlCheck = "SELECT * FROM produtos WHERE nome='$nome' AND id<>$id";
        $resultCheck = $conn->query($sqlCheck);
        if ($resultCheck->num_rows > 0) {
            echo json_encode(array("status" => "error", "message" => "Já existe um produto com esse nome."));
            exit();
        }

        $sql = "UPDATE produtos SET nome='$nome', imagem='$imagem' WHERE id=$id";

        if ($conn->query($sql) === true) {
            echo json_encode(array("status" => "success"));
        } else {
            echo json_encode(array("status" => "error", "message" => $conn->error));
        }
    } elseif ($action === "update_quantity") {
        // Atualizar a quantidade do produto no banco de dados
        $id = $data["id"];
        $quantidade = $data["quantidade"];

        $sql = "UPDATE produtos SET quantidade=$quantidade WHERE id=$id";

        if ($conn->query($sql) === true) {
            echo json_encode(array("status" => "success"));
        } else {
            echo json_encode(array("status" => "error", "message" => $conn->error));
        }

    } elseif ($action === "delete") {
        // Remover o produto do banco de dados
        $id = $data["id"];

        $sql = "DELETE FROM produtos WHERE id=$id";

        if ($conn->query($sql) === true) {
            echo json_encode(array("status" => "success"));
        } else {
            echo json_encode(array("status" => "error", "message" => $conn->error));
        }
    } elseif ($action === "get") {
        // Obter todos os produtos do banco de dados
        $sql = "SELECT * FROM produtos";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            $products = array();

            while ($row = $result->fetch_assoc()) {
                $product = array(
                    "id" => $row["id"],
                    "nome" => $row["nome"],
                    "quantidade" => $row["quantidade"],
                    "imagem" => $row["imagem"]
                );

                array_push($products, $product);
            }

            echo json_encode($products);
        } else {
            echo json_encode(array());
        }
    } else {
        echo json_encode(array("status" => "error", "message" => "Ação inválida."));
    }
} else {
    echo json_encode(array("status" => "error", "message" => "Nenhuma ação especificada."));
}

$conn->close();
?>
