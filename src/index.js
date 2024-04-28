const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(express.json());

const productosRouter = express.Router();
const productosFilePath = path.join(__dirname, 'productos.json');

const readProductosFile = () => {
    try {
        const productosData = fs.readFileSync(productosFilePath, 'utf8');
        return JSON.parse(productosData);
    } catch (error) {
        return [];
    }
};

const writeProductosFile = (data) => {
    fs.writeFileSync(productosFilePath, JSON.stringify(data, null, 2), 'utf8');
};

productosRouter.get('/', (req, res) => {
    const productos = readProductosFile();
    res.json(productos);
});

productosRouter.get('/:pid', (req, res) => {
    const productos = readProductosFile();
    const producto = productos.find((p) => p.id === req.params.pid);

    if (producto) {
        res.json(producto);
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

productosRouter.post('/', (req, res) => {
    const productos = readProductosFile();
    const nuevoProducto = {
        id: Date.now().toString(),
        ...req.body,
    };
    productos.push(nuevoProducto);
    writeProductosFile(productos);
    res.json(nuevoProducto);
});

productosRouter.put('/:pid', (req, res) => {
    const productos = readProductosFile();
    const index = productos.findIndex((p) => p.id === req.params.pid);
    if (index !== -1) {
        productos[index] = { ...productos[index], ...req.body, id: req.params.pid };
        writeProductosFile(productos);
        res.json(productos[index]);
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

productosRouter.delete('/:pid', (req, res) => {
    const productos = readProductosFile();
    const index = productos.findIndex((p) => p.id === req.params.pid);
    if (index !== -1) {
        const deletedProduct = productos.splice(index, 1)[0];
        writeProductosFile(productos);
        res.json(deletedProduct);
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

app.use('/api/products', productosRouter);

const carritosRouter = express.Router();
const carritosFilePath = path.join(__dirname, 'carrito.json');

const readCarritosFile = () => {
    try {
        const carritosData = fs.readFileSync(carritosFilePath, 'utf8');
        return JSON.parse(carritosData);
    } catch (error) {
        return [];
    }
};

const writeCarritosFile = (data) => {
    fs.writeFileSync(carritosFilePath, JSON.stringify(data, null, 2), 'utf8');
};

carritosRouter.post('/', (req, res) => {
    const carritos = readCarritosFile();
    const nuevoCarrito = {
        id: Date.now().toString(),
        products: [],
    };
    carritos.push(nuevoCarrito);
    writeCarritosFile(carritos);
    res.json(nuevoCarrito);
});

carritosRouter.get('/:cid', (req, res) => {
    const carritos = readCarritosFile();
    const carrito = carritos.find((c) => c.id === req.params.cid);
    res.json(carrito ? carrito.products : []);
});

carritosRouter.post('/:cid/product/:pid', (req, res) => {
    const carritos = readCarritosFile();
    const carritoIndex = carritos.findIndex((c) => c.id === req.params.cid);

    if (carritoIndex !== -1) {
        const productoId = req.params.pid;
        const carrito = carritos[carritoIndex];
        const existingProduct = carrito.products.find((p) => p.product === productoId);

        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            carrito.products.push({ product: productoId, quantity: 1 });
        }

        writeCarritosFile(carritos);
        res.json(carrito.products);
    } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
    }
});

app.use('/api/carts', carritosRouter);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});