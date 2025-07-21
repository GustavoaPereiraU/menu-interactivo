
import { db, ref, set, push, get, child, update, onValue, remove } from './firebase.js';

// 🏠 Sala o Discoteca actual
let currentRoom = 'default'; // Cambia este valor con setRoom()

export function setRoom(roomId) {
  currentRoom = roomId;
}

// 📥 Escuchar solicitudes en tiempo real
export function listenToRequests(callback) {
  const requestsRef = ref(db, `djRequests/${currentRoom}`);
  onValue(requestsRef, snapshot => {
    const data = snapshot.val() || {};
    const requests = Object.entries(data).map(([id, value]) => ({ id, ...value }));
    callback(requests);
  });
}

// 💾 Guardar una nueva solicitud
export async function saveRequest(request) {
  const newRef = push(ref(db, `djRequests/${currentRoom}`));
  await set(newRef, request);
}

// 📄 Obtener todas las solicitudes
export async function getStoredRequests() {
  const snapshot = await get(child(ref(db), `djRequests/${currentRoom}`));
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.entries(data).map(([id, value]) => ({ id, ...value }));
  } else {
    return [];
  }
}

// 🔁 Actualizar una solicitud
export async function updateRequest(id, updates) {
  await update(ref(db, `djRequests/${currentRoom}/${id}`), updates);
}

// ❌ Eliminar una solicitud
export async function removeRequest(id) {
  await remove(ref(db, `djRequests/${currentRoom}/${id}`));
}

// 🧹 Eliminar todas las solicitudes
export async function clearAllRequests() {
  await remove(ref(db, `djRequests/${currentRoom}`));
}
