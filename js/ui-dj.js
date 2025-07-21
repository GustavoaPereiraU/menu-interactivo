// ui-dj.js

// 🔗 Importar funciones necesarias desde módulos del proyecto
import {
  listenToRequests,
  getStoredRequests,
  updateRequest,
  removeRequest,
  clearAllRequests,
  setRoom
} from './request-service.js';

import {
  auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  db,
  ref,
  get
} from './firebase.js';

// ======================================
// 📊 Variables de estado
// ======================================

let currentFilter = 'all';            // Estado del filtro (pendientes, reproducidas, etc.)
let autoRefreshInterval = null;       // Control del refresco automático

// Opcional: nombres bonitos para mostrar en UI
const roomNames = {
  'dj@dejavu.com': 'Discoteca Dejavu',
  'dj@eclipse.com': 'Club Eclipse'
};

// ======================================
// 🔐 1. Detectar sesión activa y cargar sala desde Firebase
// ======================================

// ✅ Definición antes de usarla
const showMainPanel = () => {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('mainPanel').style.display = 'block';
  loadRequests();
  startAutoRefresh();
};

// 🧠 Detectar si el usuario ya está autenticado (login persistente)
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("✅ DJ logueado:", user.email, "UID:", user.uid);

    // Verificar que no sea anónimo
    if (user.isAnonymous) {
      console.warn("🚫 Usuario anónimo detectado en vista de DJ. Redirigiendo...");
      alert("Esta sección es solo para DJs registrados.");
      signOut(auth).then(() => location.reload());
      return;
    }
    // Leer la sala desde Firebase
    const userRef = ref(db, `admin/djs/${user.uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const room = data.room;

      // Visualmente mostrar la sala
      document.body.dataset.room = room;
      document.getElementById("roomDisplay").textContent = `📍 Sala activa: ${room}`;
      document.getElementById("roomNamePlaceholder").textContent = room;

      // Configurar la sala en el servicio
      setRoom(room);
      console.log("🎧 Sala asignada:", room);

      // ✅ Mostrar panel
      showMainPanel();

    } else {
      alert("❌ Este DJ no tiene una sala asignada.");
    }
  }
});

// ======================================
// 🔔 2. Notificación y sonido de alerta
// ======================================

// Cargar el sonido de notificación
const sound = new Audio('sounds/notification.mp3');

// Solicitar permisos de notificación si no están dados
if (Notification.permission !== 'granted') {
  Notification.requestPermission();
}

// ======================================
// 🔐 3. Login con email/contraseña (formulario)
// ======================================

document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const email = `${username}@yourapp.com`;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      // La sesión activa ya será manejada por onAuthStateChanged arriba
    })
    .catch((error) => {
      alert('❌ Error al iniciar sesión: ' + error.message);
    });
});

// ======================================
// 🔓 4. Cerrar sesión
// ======================================

function logout() {
  if (confirm('¿Cerrar sesión?')) {
    signOut(auth).then(() => {
      location.reload(); // Forzar recarga completa de la app
    });
  }
}

window.logout = logout;

// ======================================
// 📥 5. Cargar y mostrar solicitudes
// ======================================

async function loadRequests() {
  try {
    const requests = await getStoredRequests();
    updateStats(requests);
    renderRequests(requests);
  } catch (err) {
    console.error("❌ Error al cargar solicitudes:", err);
  }
}

// ======================================
// 📈 6. Estadísticas por estado
// ======================================

function updateStats(requests) {
  const total = requests.length;
  const pending = requests.filter(r => r.status === 'pending').length;
  const playing = requests.filter(r => r.status === 'playing').length;
  const completed = requests.filter(r => r.status === 'played').length;

  document.getElementById('totalRequests').textContent = total;
  document.getElementById('pendingRequests').textContent = pending;
  document.getElementById('playingRequests').textContent = playing;
  document.getElementById('completedRequests').textContent = completed;
}

// ======================================
// 🎵 7. Renderizar solicitudes en la lista
// ======================================

function renderRequests(requests) {
  const list = document.getElementById('requestsList');
  list.innerHTML = '';

  let filtered = currentFilter === 'all'
    ? requests
    : requests.filter(r => r.status === currentFilter);

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <h3>🎵 No hay solicitudes</h3>
        <p>${currentFilter === 'all'
          ? 'Las solicitudes aparecerán aquí cuando los clientes las envíen'
          : `No hay solicitudes ${getFilterLabel(currentFilter)}`}</p>
      </div>
    `;
    return;
  }

  list.innerHTML = filtered.map((r, i) => `
    <div class="request-item ${r.status}">
      <div class="status-indicator status-${r.status}">
        ${getStatusLabel(r.status)}
      </div>

      <div class="request-header">
        <div class="request-number">#${i + 1}</div>
        <div class="request-actions">
          ${r.status === 'pending'
            ? `<button class="action-btn btn-play" onclick="updateRequestUI('${r.id}', 'playing')">▶️ Reproducir</button>` : ''}
          ${r.status === 'playing'
            ? `<button class="action-btn btn-done" onclick="updateRequestUI('${r.id}', 'played')">✅ Completar</button>` : ''}
          ${r.status === 'played'
            ? `<button class="action-btn btn-play" onclick="updateRequestUI('${r.id}', 'pending')">🔄 Pendiente</button>` : ''}
          <button class="action-btn btn-remove" onclick="removeRequestUI('${r.id}')">🗑️ Eliminar</button>
        </div>
      </div>

      <div class="song-info">🎵 ${r.song}</div>
      <div class="artist-info">👤 ${r.artist}</div>
      <div class="request-meta">
        📝 Solicitado por: <strong>${r.requester || 'Anónimo'}</strong> • 
        ⏰ ${new Date(r.timestamp).toLocaleString('es-ES')}
      </div>
      ${r.notes ? `<div class="request-note">💭 ${r.notes}</div>` : ''}
    </div>
  `).join('');
}

// ======================================
// 🏷️ 8. Etiquetas por estado
// ======================================

function getStatusLabel(status) {
  return {
    pending: 'Pendiente',
    playing: 'Reproduciendo',
    played: 'Completada'
  }[status] || status;
}

function getFilterLabel(filter) {
  return {
    pending: 'pendientes',
    playing: 'reproduciéndose',
    played: 'completadas'
  }[filter] || filter;
}

// ======================================
// 🧼 9. Filtro por tipo de solicitud
// ======================================

function filterRequests(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  loadRequests();
}

window.filterRequests = filterRequests;

// ======================================
// 🔁 10. Refresco automático
// ======================================

function startAutoRefresh() {
  const checkbox = document.getElementById('autoRefresh');
  if (checkbox.checked) {
    autoRefreshInterval = setInterval(loadRequests, 3000);
  }
}

function stopAutoRefresh() {
  clearInterval(autoRefreshInterval);
}

document.getElementById('autoRefresh').addEventListener('change', function () {
  if (this.checked) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
});

// ======================================
// 🧩 11. Acciones públicas: actualizar, eliminar, limpiar
// ======================================

window.updateRequestUI = async (id, newStatus) => {
  await updateRequest(id, { status: newStatus });
  loadRequests();
};

window.removeRequestUI = async (id) => {
  await removeRequest(id);
  loadRequests();
};

window.clearAllRequests = async () => {
  if (confirm('¿Estás seguro de que quieres eliminar todas las solicitudes?')) {
    await clearAllRequests();
    loadRequests();
  }
};

// ======================================
// 📡 12. Escuchar solicitudes en tiempo real
// ======================================

let lastRequestCount = 0;

listenToRequests((requests) => {
  renderRequests(requests);
  updateStats(requests);

  if (requests.length > lastRequestCount) {
    const newCount = requests.length - lastRequestCount;
    triggerNewRequestAlert(newCount);
  }

  lastRequestCount = requests.length;
});

// ======================================
// 🔔 13. Notificación por nueva solicitud
// ======================================

function triggerNewRequestAlert(newCount = 1) {
  try {
    sound.play();
  } catch (e) {
    console.warn('No se pudo reproducir el sonido');
  }

  if (navigator.vibrate) {
    navigator.vibrate([100, 100, 200]);
  }

  if (Notification.permission === 'granted') {
    new Notification(`🎵 Nueva solicitud DJ`, {
      body: `Tienes ${newCount} nueva(s) canción(es) en la lista.`,
      icon: 'https://cdn-icons-png.flaticon.com/512/727/727245.png'
    });
  }
}
