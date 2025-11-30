// --- 1. FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyCMU9Q-Rlk8JHPA8gUAguij5pSxjCzDvx4",
    authDomain: "dreamy-7e515.firebaseapp.com",
    projectId: "dreamy-7e515",
    storageBucket: "dreamy-7e515.firebasestorage.app",
    messagingSenderId: "626645327074",
    appId: "1:626645327074:web:b7279179e9cb728eb212bb",
    measurementId: "G-06XVPQ0REJ"
};

if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();

    auth.onAuthStateChanged((user) => {
        document.body.classList.remove('auth-loading');
        const path = window.location.pathname;

        if (user) {
            // Logged In
            if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
                window.location.href = 'dashboard.html';
            }
            
            // Update Avatar in Dashboard/Settings
            const display = document.getElementById('userDisplay');
            if (display) {
                const letter = user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U';
                display.innerHTML = `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg, #2DD4BF, #A855F7);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;">${letter}</div>`;
            }

            // Update "Sign In" button on public pages to "Dashboard"
            const navBtn = document.querySelector('.nav-btn');
            if(navBtn && !path.includes('dashboard') && !path.includes('settings')) {
                navBtn.textContent = "Go to Dashboard";
                navBtn.onclick = () => window.location.href = 'dashboard.html';
            }

        } else {
            // Logged Out
            if (path.includes('dashboard.html') || path.includes('settings.html')) {
                window.location.href = 'index.html';
            }
        }
    });

    window.googleLogin = () => auth.signInWithPopup(provider).catch(e => alert(e.message));
    window.logout = () => auth.signOut().then(() => window.location.href = 'index.html');
}

// --- 2. SETTINGS MENU TOGGLE ---
const settingsBtn = document.getElementById('settingsBtn');
const settingsMenu = document.getElementById('settingsMenu');
if(settingsBtn && settingsMenu) {
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMenu.classList.toggle('active'); // Changed from hidden to active for better CSS control
    });
    document.addEventListener('click', () => settingsMenu.classList.remove('active'));
}

// --- 3. BACKEND API CALL ---
const generateBtn = document.getElementById('generateBtn');
const promptInput = document.getElementById('promptInput');
const closeBtn = document.getElementById('closePreviewBtn');

if (generateBtn && promptInput) {
    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) return;

        document.getElementById('emptyState').classList.add('hidden');
        document.getElementById('loadingState').classList.remove('hidden');

        try {
            const response = await fetch('https://my-gemini-backend.vercel.app/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt })
            });

            const data = await response.json();
            document.getElementById('loadingState').classList.add('hidden');
            document.getElementById('resultState').classList.remove('hidden');

            const htmlCode = data.html || data.reply || data.result || "<h1>Error: No HTML returned</h1>";
            
            const iframe = document.getElementById('previewFrame');
            const doc = iframe.contentWindow.document;
            doc.open();
            doc.write(htmlCode);
            doc.close();

        } catch (error) {
            console.error(error);
            alert("Error connecting to AI: " + error.message);
            document.getElementById('loadingState').classList.add('hidden');
            document.getElementById('emptyState').classList.remove('hidden');
        }
    });
}

if(closeBtn) {
    closeBtn.addEventListener('click', () => {
        document.getElementById('resultState').classList.add('hidden');
        document.getElementById('emptyState').classList.remove('hidden');
        promptInput.value = "";
    });
}

// --- 4. PARTICLES ---
const canvas = document.getElementById('stars');
if (canvas) {
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();

    const stars = Array(120).fill().map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.3
    }));

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        stars.forEach(star => {
            ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill();
            star.y -= star.speed;
            if (star.y < 0) star.y = canvas.height;
        });
        requestAnimationFrame(animate);
    }
    animate();
}