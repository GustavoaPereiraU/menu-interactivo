// ===== DATOS DEL MENÚ =====
// Objeto principal que contiene todas las categorías y sus items
const menuData = {
    entradas: {
        title: "Entradas",
        image: "/img/entrada.png",
        description: "Deliciosas opciones para comenzar tu experiencia gastronómica",
        avgPrice: "$8-15",
        items: [
            { name: "Ensalada César", description: "Lechuga romana, crutones, queso parmesano y aderezo César", price: "$12" },
            { name: "Sopa de Tomate", description: "Sopa cremosa de tomate con albahaca fresca", price: "$8" },
            { name: "Carpaccio de Res", description: "Láminas finas de res con rúcula y queso parmesano", price: "$15" },
            { name: "Bruschetta", description: "Pan tostado con tomate, albahaca y ajo", price: "$10" }
        ]
    },
    platosFuertes: {
        title: "Platos Fuertes",
        image: "/img/fuerte.png",
        description: "Platos principales elaborados con los mejores ingredientes",
        avgPrice: "$20-35",
        items: [
            { name: "Filete Mignon", description: "Corte premium con salsa de vino tinto y vegetales", price: "$35" },
            { name: "Salmón a la Parrilla", description: "Salmón fresco con hierbas y limón", price: "$28" },
            { name: "Pasta Carbonara", description: "Pasta artesanal con salsa carbonara tradicional", price: "$22" },
            { name: "Pollo Marsala", description: "Pollo con salsa de vino Marsala y champiñones", price: "$25" }
        ]
    },
    postres: {
        title: "Postres",
        image: "/img/postres.png",
        description: "Dulces tentaciones para cerrar con broche de oro",
        avgPrice: "$7-12",
        items: [
            { name: "Tiramisú", description: "Clásico italiano con café y mascarpone", price: "$10" },
            { name: "Cheesecake", description: "Pastel de queso con frutos rojos", price: "$9" },
            { name: "Creme Brûlée", description: "Crema catalana con azúcar caramelizada", price: "$11" },
            { name: "Helado Artesanal", description: "Varios sabores de helado casero", price: "$7" }
        ]
    },
    bebidas: {
        title: "Bebidas",
        image: "/img/bebidas.png",
        description: "Selección de bebidas para acompañar tu comida",
        avgPrice: "$5-25",
        items: [
            { name: "Vino Tinto", description: "Selección de vinos de la casa", price: "$25" },
            { name: "Cócteles", description: "Cocteles clásicos y de autor", price: "$15" },
            { name: "Refrescos", description: "Bebidas gaseosas y jugos naturales", price: "$5" },
            { name: "Agua Mineral", description: "Agua con o sin gas", price: "$4" }
        ]
    },
    licores: {
        title: "Licores",
        image: "/img/licores.png",
        description: "Selección de bebidas para acompañar tu comida",
        avgPrice: "$40-300",
        items: [
            { name: "Whisky Macallan 12 años", description: "Notas de roble, vainilla y frutos secos.", price: "$45"},
            { name: "Ron Zacapa Centenario", description: "Ron guatemalteco añejado en sistema solera. Dulce y complejo.", price: "$40" },
            { name: "Vodka Belvedere", description: "Vodka polaco de lujo, destilado de centeno y sin aditivos.", price: "$50" },
            { name: "Ginebra Tanqueray No. Ten", description: "Perfecta para gin-tonic premium. Botánicos cítricos frescos.", price: "$38" }
        ]
    }
    
};

// ===== FUNCIONES PRINCIPALES =====

/**
 * Función para crear las tarjetas de categorías
 * Genera el HTML dinámicamente basado en los datos del menú
 */
function createCategoryCards() {
    const container = document.getElementById('categoriesContainer');
    
    // Iterar sobre cada categoría en los datos
    for (const categoryKey in menuData) {
        const category = menuData[categoryKey];
        
        // Crear el elemento de la tarjeta
        const card = document.createElement('div');
        card.className = 'category-card';
        card.setAttribute('data-category', categoryKey);
        
        // Construir el contenido HTML de la tarjeta
        card.innerHTML = `
            <div class="category-image"><img src="${category.image}" alt="Imagen de ${category.title}"></div>
            <h3 class="category-title">${category.title}</h3>
            <p class="category-description">${category.description}</p>
            <p class="category-price">Precio promedio: ${category.avgPrice}</p>
        `;
        
        // Agregar evento click a la tarjeta
        card.addEventListener('click', () => openCategoryModal(categoryKey));
        
        // Agregar la tarjeta al contenedor
        container.appendChild(card);
        
        // Agregar animación de entrada escalonada
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, Object.keys(menuData).indexOf(categoryKey) * 150);
    }
}

/**
 * Función para abrir el modal con los detalles de la categoría
 * @param {string} categoryKey - La clave de la categoría a mostrar
 */
function openCategoryModal(categoryKey) {
    const modal = document.getElementById('categoryModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalItems = document.getElementById('modalItems');
    
    // Obtener los datos de la categoría
    const category = menuData[categoryKey];
    
    // Establecer el título del modal
    modalTitle.textContent = `${category.icon} ${category.title}`;
    
    // Limpiar contenido previo
    modalItems.innerHTML = '';
    
    // Agregar los items de la categoría
    category.items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'modal-item';
        itemElement.style.opacity = '0';
        itemElement.style.transform = 'translateX(-30px)';
        
        itemElement.innerHTML = `
            <h4>${item.name}</h4>
            <p>${item.description}</p>
            <p class="price">${item.price}</p>
        `;
        
        modalItems.appendChild(itemElement);
        
        // Animación de entrada para cada item
        setTimeout(() => {
            itemElement.style.transition = 'all 0.3s ease';
            itemElement.style.opacity = '1';
            itemElement.style.transform = 'translateX(0)';
        }, index * 100);
    });
    
    // Mostrar el modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
}

/**
 * Función para cerrar el modal
 */
function closeModal() {
    const modal = document.getElementById('categoryModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restaurar scroll del body
}

// ===== EVENT LISTENERS =====

// Evento para cerrar el modal al hacer clic en la X
document.getElementById('closeModal').addEventListener('click', closeModal);

// Evento para cerrar el modal al hacer clic fuera del contenido
document.getElementById('categoryModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('categoryModal')) {
        closeModal();
    }
});

// Evento para cerrar el modal con la tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('categoryModal').style.display === 'block') {
        closeModal();
    }
});

// ===== INICIALIZACIÓN =====

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Crear las tarjetas de categorías
    createCategoryCards();
    
    // Agregar efecto de parallax suave al header
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const header = document.querySelector('.menu-header');
        header.style.transform = `translateY(${scrolled * 0.3}px)`;
    });
});

// ===== FUNCIONES ADICIONALES PARA MEJORAR LA EXPERIENCIA =====

/**
 * Función para agregar efecto de máquina de escribir al título
 */
function typeWriterEffect(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Agregar efecto de máquina de escribir al subtítulo cuando la página carga
window.addEventListener('load', () => {
    const subtitle = document.querySelector('.menu-subtitle');
    const originalText = subtitle.textContent;
    typeWriterEffect(subtitle, originalText, 80);
});