// admin-panel.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔐 Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDEnhh2JostypNUHOmSbLXNefyeEYDnvFY",
  authDomain: "app-dj-f50c9.firebaseapp.com",
  databaseURL: "https://app-dj-f50c9-default-rtdb.firebaseio.com",
  projectId: "app-dj-f50c9",
  storageBucket: "app-dj-f50c9.appspot.com",
  messagingSenderId: "493254363361",
  appId: "1:493254363361:web:db60e325ab67bd8cd1cfa0",
  measurementId: "G-E55ELMZQWT"
};

// 🚀 Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// =======================
// 🔐 Login Admin
// =======================
let adminEmail = null;
let adminPassword = null;

document.getElementById("adminLoginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  adminEmail = document.getElementById("adminEmail").value;
  adminPassword = document.getElementById("adminPassword").value;

  try {
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log("✅ Login correcto");
  } catch (error) {
    alert("❌ Error al iniciar sesión: " + error.message);
  }
});

// =======================
// 👀 Observador de sesión
// =======================
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("✅ Logueado como", user.email, "UID:", user.uid);

    if (user.uid !== 'fe5GoV23P4O8OJhmg2m9zeUThCy2') {
      alert("⛔ No tienes permiso para acceder a este panel.");
      await signOut(auth);
      return;
    }

    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";

    loadUsers();
  } else {
    document.getElementById("loginScreen").style.display = "block";
    document.getElementById("adminPanel").style.display = "none";
  }
});

// =======================
// ➕ Crear nuevo DJ
// =======================
document.getElementById('createUserForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!adminEmail || !adminPassword) {
    alert("⚠️ Debes volver a iniciar sesión como admin.");
    return;
  }

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const room = document.getElementById('room').value.trim();
  const email = `${username}@yourapp.com`;

  try {
    // Validar duplicados
    const snapshot = await get(ref(db, 'admin/djs'));
    const djs = snapshot.val() || {};

    const usernameExists = Object.values(djs).some(dj => dj.username === username);
    const roomExists = Object.values(djs).some(dj => dj.room === room);

    if (usernameExists) {
      alert(`⚠️ Ya existe un DJ con el nombre de usuario "${username}".`);
      return;
    }

    if (roomExists) {
      alert(`⚠️ Ya hay una sala con el nombre "${room}". Elige otra sala.`);
      return;
    }

    // Crear usuario (esto cambia la sesión)
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Restaurar sesión de admin
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

    // Guardar DJ en la base de datos
    await set(ref(db, `admin/djs/${uid}`), {
      username,
      email,
      room,
      createdAt: Date.now()
    });

    alert(`✅ DJ ${username} creado con éxito.`);
    e.target.reset();
    loadUsers();

  } catch (error) {
    alert(`❌ Error al crear DJ: ${error.message}`);
  }
});

// =======================
// 📋 Cargar DJs
// =======================
function loadUsers() {
  const list = document.getElementById('userList');
  list.innerHTML = 'Cargando...';

  get(ref(db, 'admin/djs')).then(snapshot => {
    const data = snapshot.val() || {};
    const html = Object.entries(data).map(([uid, user]) => `
      <li>
        <strong>${user.username}</strong> — Sala: <em>${user.room}</em> — Email: ${user.email}
        <button onclick="deleteDJ('${uid}', '${user.username}')">🗑️ Eliminar</button>
      </li>
    `).join('');

    list.innerHTML = html || '<li>No hay DJs registrados aún.</li>';
  }).catch(error => {
    console.error("❌ Error al obtener DJs:", error);
    list.innerHTML = '<li>Error al cargar DJs.</li>';
  });
}

// =======================
// 🗑️ Eliminar DJ (solo base de datos)
// =======================
window.deleteDJ = async function (uid, username) {
  const confirmDelete = confirm(`¿Seguro que deseas eliminar al DJ "${username}"? Esta acción no se puede deshacer.`);
  if (!confirmDelete) return;

  try {
    await remove(ref(db, `admin/djs/${uid}`));
    alert(`✅ DJ "${username}" eliminado correctamente.`);
    loadUsers();
  } catch (error) {
    alert(`❌ Error al eliminar DJ: ${error.message}`);
  }
};

// =======================
// 🚪 Cerrar sesión
// =======================
document.getElementById('adminLogoutBtn').addEventListener('click', async () => {
  const confirmLogout = confirm('¿Seguro que quieres cerrar sesión?');
  if (confirmLogout) {
    await signOut(auth);
    location.reload();
  }
});
