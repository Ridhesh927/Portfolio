/**
 * RIDHESH MAHAJAN — NEO-BRUTALIST PORTFOLIO
 * Vanilla JavaScript (Zero External Dependencies)
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Footer Year
    const yearEl = document.getElementById("current-year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // 2. Mobile Navigation Toggle
    const mobileToggle = document.getElementById("mobile-toggle");
    const navMenu = document.getElementById("nav-menu");

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener("click", () => {
            const isExpanded = mobileToggle.getAttribute("aria-expanded") === "true";
            mobileToggle.setAttribute("aria-expanded", String(!isExpanded));
            navMenu.classList.toggle("is-active");
        });

        // Close mobile menu on clicking any navigation link
        navMenu.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("is-active");
                mobileToggle.setAttribute("aria-expanded", "false");
            });
        });

        // Close menu on click outside
        document.addEventListener("click", (e) => {
            if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains("is-active")) {
                navMenu.classList.remove("is-active");
                mobileToggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    // 3. Project Category Filter
    const filterButtons = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".project-card");

    if (filterButtons.length > 0 && projectCards.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                filterButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                const filterValue = btn.getAttribute("data-filter");

                projectCards.forEach(card => {
                    const categories = card.getAttribute("data-category") || "";
                    if (filterValue === "all" || categories.includes(filterValue)) {
                        card.classList.remove("is-hidden");
                    } else {
                        card.classList.add("is-hidden");
                    }
                });
            });
        });
    }

    // 4. Interactive Stack Pills (Highlights relevant projects)
    const stackPills = document.querySelectorAll(".stack-pill");
    if (stackPills.length > 0 && projectCards.length > 0) {
        stackPills.forEach(pill => {
            pill.addEventListener("mouseenter", () => {
                const techName = pill.textContent.trim().toLowerCase();
                projectCards.forEach(card => {
                    const cardText = card.textContent.toLowerCase();
                    if (cardText.includes(techName)) {
                        card.style.borderColor = "var(--orange)";
                    }
                });
            });

            pill.addEventListener("mouseleave", () => {
                projectCards.forEach(card => {
                    card.style.borderColor = "";
                });
            });
        });
    }

    // 5. One-Click Copy Email
    const copyEmailBtn = document.getElementById("copy-email-btn");
    const copyFeedback = document.getElementById("copy-feedback");
    const emailToCopy = "ridheshmahajan.despu.cse@gmail.com";

    if (copyEmailBtn && copyFeedback) {
        copyEmailBtn.addEventListener("click", async () => {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(emailToCopy);
                } else {
                    const textArea = document.createElement("textarea");
                    textArea.value = emailToCopy;
                    textArea.style.position = "fixed";
                    textArea.style.left = "-999999px";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand("copy");
                    textArea.remove();
                }

                copyFeedback.textContent = "✓ COPIED TO CLIPBOARD!";
                copyFeedback.style.color = "#16a34a";
                copyEmailBtn.style.backgroundColor = "var(--green)";

                setTimeout(() => {
                    copyFeedback.textContent = "";
                    copyEmailBtn.style.backgroundColor = "";
                }, 3000);
            } catch (err) {
                copyFeedback.textContent = "PRESS CTRL+C TO COPY";
                copyFeedback.style.color = "#dc2626";
            }
        });
    }

    // 6. Smooth Scrolling for Internal Hash Anchors with Header Offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // 7. Baby Shark Arcade Mini-Game
    const sharkModal = document.getElementById("shark-modal");
    const sharkCloseBtn = document.getElementById("shark-modal-close");
    const playSharkBtn = document.getElementById("play-shark-btn");
    const sharkSticker = document.getElementById("shark-sticker");
    const canvas = document.getElementById("shark-canvas");
    const scoreEl = document.getElementById("game-score");
    const highEl = document.getElementById("game-high");
    const startBtn = document.getElementById("game-start-btn");

    let animationId = null;
    let sharkY = 120;
    let sharkVelocity = 0;
    let gravity = 0.35;
    let obstacles = [];
    let score = 0;
    let highScore = localStorage.getItem("shark_high_score") || 12;
    let isGameOver = false;
    let gameRunning = false;

    if (highEl) highEl.textContent = highScore;

    function playBeep(freq = 440, duration = 0.08) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "square";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Audio context policy or disabled
        }
    }

    function initGame() {
        if (!canvas) return;
        sharkY = canvas.height / 2;
        sharkVelocity = 0;
        obstacles = [];
        score = 0;
        isGameOver = false;
        gameRunning = true;
        if (scoreEl) scoreEl.textContent = "0";

        // Spawn first obstacle
        spawnObstacle();

        if (animationId) cancelAnimationFrame(animationId);
        gameLoop();
    }

    function spawnObstacle() {
        if (!canvas) return;
        const gap = 90;
        const topHeight = Math.floor(Math.random() * (canvas.height - gap - 40)) + 20;
        obstacles.push({
            x: canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + gap,
            width: 32,
            passed: false
        });
    }

    function jump() {
        if (isGameOver) {
            initGame();
            return;
        }
        sharkVelocity = -5.8;
        playBeep(587, 0.06); // D5 jump beep
    }

    function gameLoop() {
        if (!canvas || !gameRunning) return;
        const ctx = canvas.getContext("2d");

        // Clear background (deep ocean blue)
        ctx.fillStyle = "#03045E";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw retro wave lines
        ctx.strokeStyle = "rgba(0, 180, 216, 0.25)";
        ctx.lineWidth = 2;
        for (let y = 30; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Update Shark
        sharkVelocity += gravity;
        sharkY += sharkVelocity;

        // Draw Baby Shark
        ctx.save();
        ctx.font = "28px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🦈", 60, sharkY);
        ctx.restore();

        // Floor / Ceiling bounds
        if (sharkY < 15 || sharkY > canvas.height - 15) {
            endGame();
            return;
        }

        // Update Obstacles
        for (let i = 0; i < obstacles.length; i++) {
            const obs = obstacles[i];
            obs.x -= 3.2;

            // Draw Coral / Pillar Obstacles (Neo-brutalist coral blocks)
            ctx.fillStyle = "#FF7A59";
            ctx.strokeStyle = "#111111";
            ctx.lineWidth = 3;

            // Top pillar
            ctx.fillRect(obs.x, 0, obs.width, obs.topHeight);
            ctx.strokeRect(obs.x, 0, obs.width, obs.topHeight);

            // Bottom pillar
            const bHeight = canvas.height - obs.bottomY;
            ctx.fillRect(obs.x, obs.bottomY, obs.width, bHeight);
            ctx.strokeRect(obs.x, obs.bottomY, obs.width, bHeight);

            // Collision check (shark approx radius 16 around (60, sharkY))
            const sharkRadius = 14;
            const inX = (60 + sharkRadius > obs.x) && (60 - sharkRadius < obs.x + obs.width);
            const inTopY = (sharkY - sharkRadius < obs.topHeight);
            const inBottomY = (sharkY + sharkRadius > obs.bottomY);

            if (inX && (inTopY || inBottomY)) {
                endGame();
                return;
            }

            // Score check
            if (!obs.passed && obs.x + obs.width < 60) {
                obs.passed = true;
                score += 1;
                if (scoreEl) scoreEl.textContent = score;
                playBeep(880, 0.08); // A5 score chime

                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem("shark_high_score", highScore);
                    if (highEl) highEl.textContent = highScore;
                }
            }
        }

        // Clean offscreen obstacles and spawn new ones
        if (obstacles.length > 0 && obstacles[0].x < -50) {
            obstacles.shift();
        }

        if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 150) {
            spawnObstacle();
        }

        animationId = requestAnimationFrame(gameLoop);
    }

    function endGame() {
        isGameOver = true;
        gameRunning = false;
        playBeep(220, 0.25); // low game over buzz
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        // Game Over Box
        ctx.fillStyle = "rgba(17, 17, 17, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#FFD83D";
        ctx.font = "bold 24px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER!", canvas.width / 2, canvas.height / 2 - 15);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "14px 'JetBrains Mono', monospace";
        ctx.fillText("SCORE: " + score + " | TAP TO RESTART 🦈", canvas.width / 2, canvas.height / 2 + 20);
    }

    function openModal() {
        if (!sharkModal) return;
        sharkModal.classList.add("is-open");
        sharkModal.setAttribute("aria-hidden", "false");
        initGame();
    }

    function closeModal() {
        if (!sharkModal) return;
        sharkModal.classList.remove("is-open");
        sharkModal.setAttribute("aria-hidden", "true");
        gameRunning = false;
        if (animationId) cancelAnimationFrame(animationId);
    }

    if (playSharkBtn) playSharkBtn.addEventListener("click", openModal);
    if (sharkSticker) sharkSticker.addEventListener("click", openModal);
    if (sharkCloseBtn) sharkCloseBtn.addEventListener("click", closeModal);
    if (startBtn) startBtn.addEventListener("click", () => {
        if (isGameOver) initGame();
        else jump();
    });

    if (canvas) {
        canvas.addEventListener("click", jump);
        canvas.addEventListener("touchstart", (e) => {
            e.preventDefault();
            jump();
        });
    }

    window.addEventListener("keydown", (e) => {
        if (e.code === "Space" && sharkModal && sharkModal.classList.contains("is-open")) {
            e.preventDefault();
            jump();
        }
        if (e.key === "Escape" && sharkModal && sharkModal.classList.contains("is-open")) {
            closeModal();
        }
    });

    if (sharkModal) {
        sharkModal.addEventListener("click", (e) => {
            if (e.target === sharkModal) closeModal();
        });
    }
});
