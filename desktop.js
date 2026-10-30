const desktop = document.getElementById('desktop');
let activeFolder = null;
let pointerId = null;
let startX = 0;
let startY = 0;
let didDrag = false;
let pointerCaptured = false;

const DRAG_THRESHOLD = 5;

// En móvil la carpeta de system-logs arranca más abajo para no tapar el logo ASCII
const MOBILE_DEFAULTS = {
    'folder-system': { left: '18%', top: '40%' }
};

document.addEventListener('dragstart', (e) => e.preventDefault());

// Los clicks sin arrastre navegan de forma nativa. Si el usuario acaba de arrastrar,
// se descarta el click que el navegador dispara al soltar el puntero.
desktop.addEventListener('click', (e) => {
    if (!didDrag) return;
    didDrag = false;
    e.preventDefault();
    e.stopImmediatePropagation();
}, true);

desktop.addEventListener('pointerdown', (e) => {
    const folder = e.target.closest('.folder');
    if (!folder || e.button !== 0) return;

    activeFolder = folder;
    pointerId = e.pointerId;
    didDrag = false;
    pointerCaptured = false;

    startX = e.clientX;
    startY = e.clientY;

    const rect = activeFolder.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const onPointerMove = (moveEvent) => {
        if (moveEvent.pointerId !== pointerId || !activeFolder) return;

        if (!didDrag) {
            const deltaX = Math.abs(moveEvent.clientX - startX);
            const deltaY = Math.abs(moveEvent.clientY - startY);
            if (deltaX <= DRAG_THRESHOLD && deltaY <= DRAG_THRESHOLD) return;

            didDrag = true;
            activeFolder.classList.add('dragging');

            // Solo se captura el puntero cuando empieza un arrastre real, para que
            // los clicks normales sigan siendo clicks nativos sobre el enlace.
            try {
                activeFolder.setPointerCapture(pointerId);
                pointerCaptured = true;
            } catch (err) {
                console.error("Pointer capture failed:", err);
            }
        }

        const newX = moveEvent.clientX - offsetX;
        const newY = moveEvent.clientY - offsetY;

        const maxX = window.innerWidth - activeFolder.offsetWidth;
        const maxY = window.innerHeight - activeFolder.offsetHeight;

        activeFolder.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
        activeFolder.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
    };

    const onPointerUp = (upEvent) => {
        if (upEvent.pointerId !== pointerId) return;

        desktop.removeEventListener('pointermove', onPointerMove);
        desktop.removeEventListener('pointerup', onPointerUp);

        try {
            if (pointerCaptured) activeFolder.releasePointerCapture(pointerId);
        } catch (err) {}
        pointerCaptured = false;

        activeFolder.classList.remove('dragging');

        if (didDrag) {
            localStorage.setItem(activeFolder.id, JSON.stringify({
                left: activeFolder.style.left,
                top: activeFolder.style.top
            }));
        }

        activeFolder = null;
    };

    desktop.addEventListener('pointermove', onPointerMove);
    desktop.addEventListener('pointerup', onPointerUp);
});

window.addEventListener('pointercancel', (e) => {
    if (!activeFolder || e.pointerId !== pointerId) return;

    try {
        if (pointerCaptured) activeFolder.releasePointerCapture(pointerId);
    } catch (err) {}
    pointerCaptured = false;

    activeFolder.classList.remove('dragging');
    activeFolder = null;
    didDrag = false;
});

window.addEventListener('load', () => {
    document.querySelectorAll('.folder').forEach(f => {
        const savedPosition = localStorage.getItem(f.id);
        if (savedPosition) {
            const { left, top } = JSON.parse(savedPosition);
            f.style.left = left;
            f.style.top = top;
        } else {
            if (window.innerWidth <= 768 && MOBILE_DEFAULTS[f.id]) {
                f.style.left = MOBILE_DEFAULTS[f.id].left;
                f.style.top = MOBILE_DEFAULTS[f.id].top;
            }
            const left = f.style.left;
            const top = f.style.top;
            if (left && left.includes('%')) {
                const px = Math.round((parseFloat(left) / 100) * window.innerWidth);
                f.style.left = px + 'px';
            }
            if (top && top.includes('%')) {
                const py = Math.round((parseFloat(top) / 100) * window.innerHeight);
                f.style.top = py + 'px';
            }
        }
    });
});

window.addEventListener('resize', () => {
    document.querySelectorAll('.folder').forEach(f => {
        const maxX = window.innerWidth - f.offsetWidth;
        const maxY = window.innerHeight - f.offsetHeight;
        let curLeft = f.offsetLeft;
        let curTop = f.offsetTop;
        if (curLeft > maxX) f.style.left = maxX + 'px';
        if (curTop > maxY) f.style.top = maxY + 'px';
    });
});
