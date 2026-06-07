const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new sqlite3.Database("./bakery.db");

db.run(`
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT NOT NULL,
        produk TEXT NOT NULL,
        jumlah INTEGER NOT NULL,
        total INTEGER NOT NULL
    )
`);

const products = [
    { nama: "Cupcake Vanilla", harga: 15000, gambar: "cupcake.jpg" },
    { nama: "Cookies Choco", harga: 12000, gambar: "cookies.jpg" },
    { nama: "Donut Strawberry", harga: 18000, gambar: "donut.jpg" }
];

app.get("/", (req, res) => {
    res.render("index", { products });
});

app.post("/add", (req, res) => {
    const nama = req.body.nama;
    const produk = req.body.produk;
    const jumlah = parseInt(req.body.jumlah);

    const selectedProduct = products.find(p => p.nama === produk);
    const total = selectedProduct.harga * jumlah;

    db.run(
        "INSERT INTO orders (nama, produk, jumlah, total) VALUES (?, ?, ?, ?)",
        [nama, produk, jumlah, total],
        (err) => {
            if (err) {
                console.log(err);
                return res.send("Gagal menyimpan data");
            }

            res.redirect("/orders");
        }
    );
});

app.get("/orders", (req, res) => {
    db.all("SELECT * FROM orders ORDER BY id DESC", (err, orders) => {
        if (err) throw err;
        res.render("orders", { orders });
    });
});

app.get("/edit/:id", (req, res) => {
    db.get("SELECT * FROM orders WHERE id = ?", [req.params.id], (err, order) => {
        if (err) throw err;
        res.render("edit", { order, products });
    });
});

app.post("/update/:id", (req, res) => {
    const nama = req.body.nama;
    const produk = req.body.produk;
    const jumlah = parseInt(req.body.jumlah);

    const selectedProduct = products.find(p => p.nama === produk);
    const total = selectedProduct.harga * jumlah;

    db.run(
        "UPDATE orders SET nama = ?, produk = ?, jumlah = ?, total = ? WHERE id = ?",
        [nama, produk, jumlah, total, req.params.id],
        (err) => {
            if (err) throw err;
            res.redirect("/orders");
        }
    );
});

app.get("/delete/:id", (req, res) => {
    db.run("DELETE FROM orders WHERE id = ?", [req.params.id], (err) => {
        if (err) throw err;
        res.redirect("/orders");
    });
});

app.listen(port, () => {
    console.log(`Server jalan di http://localhost:${port}`);
});