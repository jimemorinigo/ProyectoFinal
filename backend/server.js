const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./database");

const app = express();
const PORT = 5000;
const SECRET_KEY = "secreto123"; // 🔥 Cambiar en producción

app.use(cors());
app.use(express.json());
const path = require("path");

// 🔹 Registro de usuario
app.post("/api/register", (req, res) => {
    const { nombre, email, password, role } = req.body;

    // Encriptar la contraseña
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run("INSERT INTO usuarios (nombre, email, password, role) VALUES (?, ?, ?, ?)",
        [nombre, email, hashedPassword, role || "user"],
        function (err) {
            if (err) {
                return res.status(400).json({ error: "El usuario ya existe." });
            }
            res.json({ message: "Usuario registrado con éxito." });
        }
    );
});

// 🔹 Inicio de sesión
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: "Usuario no encontrado." });
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: "Contraseña incorrecta." });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

        res.json({ message: "Login exitoso.", token, role: user.role });
    });
});

// 🔹 Middleware para verificar token
const verificarToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ error: "Token requerido." });

    jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Token inválido." });
        req.user = decoded;
        next();
    });
};

// 🔹 Añadir producto al carrito
app.post("/api/carrito", verificarToken, (req, res) => {
    const { producto, cantidad, precio } = req.body;

    db.run("INSERT INTO carrito (usuario_id, producto, cantidad, precio) VALUES (?, ?, ?, ?)",
        [req.user.id, producto, cantidad, precio],
        function (err) {
            if (err) {
                return res.status(500).json({ error: "Error al agregar al carrito." });
            }
            res.json({ message: "Producto agregado al carrito." });
        }
    );
});

// 🔹 Obtener carrito del usuario
app.get("/api/carrito", verificarToken, (req, res) => {
    db.all("SELECT * FROM carrito WHERE usuario_id = ?", [req.user.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Error al obtener el carrito." });
        }
        res.json(rows);
    });
});

// 🔹 Vaciar carrito
app.delete("/api/carrito", verificarToken, (req, res) => {
    db.run("DELETE FROM carrito WHERE usuario_id = ?", [req.user.id], function (err) {
        if (err) {
            return res.status(500).json({ error: "Error al vaciar el carrito." });
        }
        res.json({ message: "Carrito vaciado con éxito." });
    });
});

app.use(express.static(path.join(__dirname, "../")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../index.html"));
});

// 🔹 Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});