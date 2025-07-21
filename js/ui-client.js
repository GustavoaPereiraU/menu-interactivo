// =====================================================
// 🔗 1. IMPORTAR DEPENDENCIAS NECESARIAS
// =====================================================

import {
  auth,
  signInAnonymously,
  onAuthStateChanged,
  db,
  ref,
  set,
  get
} from './firebase.js';

import {
  listenToRequests,
  saveRequest,
  setRoom
} from './request-service.js';

// =====================================================
// 🏠 2. DETECTAR LA SALA ACTIVA (desde body o URL)
// =====================================================

const room =
  document.body.dataset.room ||
  new URLSearchParams(window.location.search).get('room') ||
  'default';

const normalizedRoom = room.trim().toLowerCase();
setRoom(normalizedRoom); // Establece la sala activa globalmente en request-service.js

// Actualiza visualmente los indicadores con el nombre de la sala
const popupIndicator = document.getElementById('roomIndicator');
if (popupIndicator)
  popupIndicator.textContent = `📍 Sala: ${normalizedRoom}`;

const mainIndicator = document.getElementById('mainRoomIndicator');
if (mainIndicator)
  mainIndicator.textContent = `📍 Sala: ${normalizedRoom}`;

// =====================================================
// 🔑 3. AUTENTICACIÓN ANÓNIMA (necesaria para permisos de Firebase)
// =====================================================

signInAnonymously(auth).catch((error) => {
  console.error("❌ Error al autenticar anónimamente:", error);
});

// =====================================================
// ⚡ 4. UNA VEZ AUTENTICADO, REGISTRAR CLIENTE Y ESCUCHAR CAMBIOS
// =====================================================

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("✅ Usuario anónimo autenticado:", user.uid);

    const userRef = ref(db, `admin/clients/${user.uid}`);
    const snapshot = await get(userRef);

    // Guarda la sala asignada al cliente solo si no existe ya
    if (!snapshot.exists()) {
      await set(userRef, { room: normalizedRoom });
      console.log(`✅ Cliente anónimo registrado con sala: ${normalizedRoom}`);
    } else {
      console.log(`ℹ️ Ya existe una sala para el usuario:`, snapshot.val());
    }

    // Iniciar contador de canciones en tiempo real
    updateQueueCount();
    setInterval(updateQueueCount, 5000);

    // Activar formularios de envío de canciones
    document.getElementById('songForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('popupSongForm').addEventListener('submit', handlePopupFormSubmit);
  }
});

// =====================================================
// 🔄 5. ACTUALIZAR CANTIDAD DE CANCIONES EN COLA
// =====================================================

function updateQueueCount() {
  listenToRequests((requests) => {
    // Mostrar cantidad de canciones
    document.getElementById('queueNumber').textContent = requests.length;

    // Si todas están pendientes, se asume que el DJ está inactivo
    const isDJInactive = requests.every(r => r.status === 'pending');
    const notice = document.getElementById('djOfflineNotice');

    if (notice) {
      notice.style.display = isDJInactive ? 'block' : 'none';
    }
  });
}

// =====================================================
// 📤 6. ENVÍO DE FORMULARIOS DE SOLICITUDES
// =====================================================

// Principal
function handleFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  addSongRequest(formData, 'successMessage'); // Mensaje bajo el formulario
  e.target.reset();
}

// Popup
function handlePopupFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  addSongRequest(formData, 'popupSuccessMessage'); // Mensaje dentro del popup
  e.target.reset();
  setTimeout(() => closePopup(), 2000);
}

// =====================================================
// ✅ 7. ENVIAR SOLICITUD A FIREBASE
// =====================================================

function addSongRequest(formData, messageId) {
  const request = {
    song: formData.get('songName'),
    artist: formData.get('artistName'),
    requester: formData.get('requesterName') || 'Anónimo',
    notes: formData.get('notes') || '',
    status: 'pending',
    timestamp: Date.now()
  };

  saveRequest(request); // Módulo externo
  showSuccessMessage(messageId); // Mensaje de éxito
}

// =====================================================
// 🎉 8. MOSTRAR MENSAJE DE ÉXITO AL ENVIAR SOLICITUD
// =====================================================

function showSuccessMessage(messageId) {
  const message = document.getElementById(messageId);
  message.style.display = 'block';
  setTimeout(() => {
    message.style.display = 'none';
  }, 3000);
}

// =====================================================
// 💬 9. CONTROL DE POPUP
// =====================================================

// Abre el popup
function openPopup(button) {
  const overlay = document.getElementById('popupOverlay');
  overlay.style.display = 'flex';

  const room = button.getAttribute('data-room');
  const indicator = document.getElementById('roomIndicator');

  if (indicator && room) {
    indicator.textContent = `📍 ${room}`;
  } else if (indicator) {
    indicator.textContent = '📍 Sala no definida';
  }

  button.classList.add('active');
}

// Cierra el popup
function closePopup() {
  const overlay = document.getElementById('popupOverlay');
  overlay.style.display = 'none';

  document.getElementById('popupSuccessMessage').style.display = 'none';

  document.querySelectorAll('.floating-button').forEach(btn =>
    btn.classList.remove('active')
  );
}

// =====================================================
// 🖱️ 10. EVENTOS DE INTERFAZ
// =====================================================

document.getElementById('popupOverlay').addEventListener('click', function (e) {
  if (e.target === this) closePopup();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closePopup();
});

document.getElementById('openPopupBtn').addEventListener('click', function () {
  openPopup(this);
});

// =====================================================
// 🌍 11. FUNCIONES GLOBALES (accesibles desde HTML si se desea)
// =====================================================

window.openPopup = openPopup;
window.closePopup = closePopup;
