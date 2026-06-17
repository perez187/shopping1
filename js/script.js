const supabaseUrl = 'https://cwoqubckccnjcxwlrxts.supabase.co';
const supabaseKey = 'sb_publishable_odbwYID1v3ssXbim0x_mZg_LmuJ5qGt';
const db = supabase.createClient(supabaseUrl, supabaseKey);

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function agregarAlCarrito(varianteId, nombre, precio, talla, color) {
    const existe = carrito.find(p => p.varianteId === varianteId);
    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push({ varianteId, nombre, precio, talla, color, cantidad: 1 });
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContador();
    alert(`✅ "${nombre}" (${talla} - ${color}) agregado al carrito`);
}

function actualizarContador() {
    const contador = document.getElementById("contador-carrito");
    if (contador) {
        const total = carrito.reduce((sum, p) => sum + p.cantidad, 0);
        contador.textContent = total;
    }
}

function mostrarCarrito() {
    const lista = document.getElementById("lista-carrito");
    const totalElemento = document.getElementById("total");
    if (!lista) return;
    lista.innerHTML = "";
    let total = 0;
    carrito.forEach((producto, index) => {
        total += producto.precio * producto.cantidad;
        lista.innerHTML += `
            <div class="producto-carrito">
                <h3>${producto.nombre}</h3>
                <p>Talla: ${producto.talla} | Color: ${producto.color}</p>
                <p>$${producto.precio} × ${producto.cantidad}</p>
                <button onclick="eliminarProducto(${index})">Eliminar</button>
            </div>
        `;
    });
    if (totalElemento) totalElemento.textContent = total.toFixed(2);
}

function eliminarProducto(index) {
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
    actualizarContador();
}

async function cargarProductos() {
    const contenedor = document.getElementById("lista-productos");
    if (!contenedor) return;
    const { data, error } = await db
        .from('inventario_completo')
        .select('*');
    if (error) {
        console.error(error);
        contenedor.innerHTML = '<p style="color:white">Error al cargar productos.</p>';
        return;
    }
    contenedor.innerHTML = "";
    data.forEach(item => {
        const agotado = item.stock_actual === 0;
        contenedor.innerHTML += `
            <div class="producto">
                <h3>${item.producto}</h3>
                <p>Talla: ${item.talla} | Color: ${item.color}</p>
                <p><strong>$${item.precio}</strong></p>
                <p style="font-size:12px; color:${agotado ? 'red' : 'green'}">
                    ${agotado ? 'Agotado' : `Stock: ${item.stock_actual}`}
                </p>
                <button
                    onclick="agregarAlCarrito('${item.variante_id}', '${item.producto}', ${item.precio}, '${item.talla}', '${item.color}')"
                    ${agotado ? 'disabled style="background:gray"' : ''}
                >
                    ${agotado ? 'Agotado' : 'Agregar al carrito'}
                </button>
            </div>
        `;
    });
}

async function finalizarCompra() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }
    const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
    const { data: venta, error: errorVenta } = await db
        .from('ventas')
        .insert({ total })
        .select()
        .single();
    if (errorVenta) {
        alert("Error al procesar la compra");
        console.error(errorVenta);
        return;
    }
    const detalles = carrito.map(p => ({
        venta_id: venta.id,
        variante_id: p.varianteId,
        cantidad: p.cantidad,
        precio_unitario: p.precio
    }));
    const { error: errorDetalle } = await db
        .from('detalle_ventas')
        .insert(detalles);
    if (errorDetalle) {
        alert("Error al registrar los productos");
        console.error(errorDetalle);
        return;
    }
    carrito = [];
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContador();
    mostrarCarrito();
    alert("✅ ¡Compra realizada con éxito!");
}

actualizarContador();
mostrarCarrito();
cargarProductos();
