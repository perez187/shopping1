let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function agregarAlCarrito(nombre, precio){

    carrito.push({
        nombre: nombre,
        precio: precio
    });

    localStorage.setItem("carrito", JSON.stringify(carrito));

    actualizarContador();

    alert("Producto agregado al carrito");
}

function actualizarContador(){

    const contador = document.getElementById("contador-carrito");

    if(contador){
        contador.textContent = carrito.length;
    }
}

function mostrarCarrito(){

    const lista = document.getElementById("lista-carrito");
    const totalElemento = document.getElementById("total");

    if(!lista) return;

    lista.innerHTML = "";

    let total = 0;

    carrito.forEach((producto, index) => {

        total += producto.precio;

        lista.innerHTML += `
            <div class="producto-carrito">

                <h3>${producto.nombre}</h3>

                <p>$${producto.precio}</p>

                <button onclick="eliminarProducto(${index})">
                    Eliminar
                </button>

            </div>
        `;
    });

    if(totalElemento){
        totalElemento.textContent = total;
    }
}

function eliminarProducto(index){

    carrito.splice(index, 1);

    localStorage.setItem("carrito", JSON.stringify(carrito));

    mostrarCarrito();

    actualizarContador();
}

actualizarContador();
mostrarCarrito();