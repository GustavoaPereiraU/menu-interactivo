// dj-widget.js — Widget de solicitudes DJ con popup
(() => {
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

  const currentRoom = document.currentScript.dataset.room || 'default';

  // --- Cargar Firebase desde CDN ---
  const firebaseScript = document.createElement('script');
  firebaseScript.type = 'module';
  firebaseScript.innerHTML = `
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getDatabase, ref, set, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
    import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

    const app = initializeApp(${JSON.stringify(firebaseConfig)});
    const currentRoom = "${currentRoom}";
    const db = getDatabase(app);
    const auth = getAuth(app);

    // 🔐 Autenticación anónima + registrar la sala en admin/clients/{uid}
    signInAnonymously(auth)
      .then(cred => {
        const uid = cred.user.uid;
        const clientRef = ref(db, 'admin/clients/' + uid);
        return set(clientRef, { room: currentRoom });
      })
      .catch(console.error);

    // 🧩 Guardar solicitud en Firebase
    async function saveRequest(request) {
      const newRef = push(ref(db, 'djRequests/' + currentRoom));
      await set(newRef, request);
    }

    // 🎉 Mostrar mensaje de éxito
    function showSuccessMessage() {
      const msg = document.getElementById('popupSuccessMessage');
      msg.style.display = 'block';
      setTimeout(() => msg.style.display = 'none', 3000);
    }

    // 📤 Enviar solicitud
    function handleSubmit(e) {
      e.preventDefault();
      const form = e.target;
      const data = new FormData(form);
      const request = {
        song: data.get('songName'),
        artist: data.get('artistName'),
        requester: data.get('requesterName') || 'Anónimo',
        notes: data.get('notes') || '',
        status: 'pending',
        timestamp: Date.now()
      };
      saveRequest(request).then(() => {
        showSuccessMessage();
        form.reset();
        setTimeout(() => closePopup(), 2000);
      });
    }

    // 🖱️ Abrir / cerrar popup
    function openPopup() {
      document.getElementById('popupOverlay').style.display = 'flex';
    }
    function closePopup() {
      document.getElementById('popupOverlay').style.display = 'none';
      document.getElementById('popupSuccessMessage').style.display = 'none';
    }

    // 📦 Inyectar HTML del popup
    const popupHTML = \`
      <style>
  :root {
    --color-background: #0b0b0b;
    --color-gold: #d4af37;
    --color-white: #f5f5f5;
    --color-accent: #8c6a3f;
    --color-success: #c3e6cb;
    --color-muted: #aaaaaa;
    --font-heading: 'Playfair Display', serif;
    --font-body: 'Poppins', sans-serif;
  }

  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Poppins&display=swap');

  .floating-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: var(--color-gold);
    color: var(--color-background);
    border: none;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    font-size: 26px;
    font-weight: bold;
    cursor: pointer;
    z-index: 9999;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
    transition: transform 0.2s ease;
  }
  .floating-button:hover {
    transform: scale(1.05);
  }

  .popup-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    display: none;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
    z-index: 9998;
  }

  .popup {
    background: var(--color-background);
    padding: 25px;
    width: 90%;
    max-width: 420px;
    border: 2px solid var(--color-gold);
    border-radius: 16px;
    font-family: var(--font-body);
    color: var(--color-white);
    position: relative;
    box-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
  }

  .popup h1 {
    font-family: var(--font-heading);
    font-size: 24px;
    margin-bottom: 15px;
    color: var(--color-gold);
    text-align: center;
  }

  .popup .form-group {
    margin-bottom: 15px;
  }

  .popup label {
    display: block;
    margin-bottom: 6px;
    font-weight: 600;
    color: var(--color-white);
  }

  .popup input,
  .popup textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--color-gold);
    border-radius: 5px;
    background-color: #121212;
    color: var(--color-white);
    font-family: var(--font-body);
  }

  .popup input::placeholder,
  .popup textarea::placeholder {
    color: var(--color-muted);
  }

  .popup .submit-btn {
    background: var(--color-gold);
    color: var(--color-background);
    padding: 12px;
    width: 100%;
    border: none;
    border-radius: 5px;
    font-weight: bold;
    font-size: 15px;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .popup .submit-btn:hover {
    background: var(--color-accent);
  }

  .popup .close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    background: transparent;
    border: none;
    font-size: 22px;
    color: var(--color-gold);
    cursor: pointer;
  }

  .success-message {
    background: var(--color-success);
    color: #1e4620;
    padding: 12px;
    margin-top: 10px;
    display: none;
    border-radius: 6px;
    font-weight: 500;
  }

  .branding {
    text-align: center;
    margin-top: 15px;
    font-size: 12px;
    color: var(--color-muted);
    font-style: italic;
  }
</style>
        <button class="floating-button" id="djWidgetButton" title="Haz tu solicitud">
        <span>🎶</span>
        </button>
      <div class="popup-overlay" id="popupOverlay">
        <div class="popup">
          <button class="close-btn" onclick="closePopup()">&times;</button>
          <h1>🎵 DJ Song Request</h1>
          <form id="popupSongForm">
            <div class="form-group">
              <label>🎵 Nombre de la canción *</label>
              <input type="text" name="songName" required />
            </div>
            <div class="form-group">
              <label>👤 Artista *</label>
              <input type="text" name="artistName" required />
            </div>
            <div class="form-group">
              <label>📝 Tu nombre (opcional)</label>
              <input type="text" name="requesterName" />
            </div>
            <div class="form-group">
              <label>💭 Nota especial (opcional)</label>
              <textarea name="notes"></textarea>
            </div>
            <button type="submit" class="submit-btn">Enviar</button>
          </form>
          <div class="success-message" id="popupSuccessMessage">
            ✅ ¡Solicitud enviada!
          </div>
          <div class="branding">Powered by GuzzDev</div>
        </div>
      </div>
    \`;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = popupHTML;
    document.body.appendChild(wrapper);

    document.getElementById('popupSongForm').addEventListener('submit', handleSubmit);
    document.getElementById('djWidgetButton').addEventListener('click', openPopup);
    document.getElementById('popupOverlay').addEventListener('click', e => {
      if (e.target.id === 'popupOverlay') closePopup();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closePopup();
    });

    // Exponer globales
    window.closePopup = closePopup;
    window.openPopup = openPopup;
  `;
  document.body.appendChild(firebaseScript);
})();
// --- Fin del widget de solicitudes DJ ---