const desktop = document.getElementById('desktop');
let activeFolder = null;
let pointerId = null;
let startX = 0;
let startY = 0;

const DRAG_THRESHOLD = 5; // Umbral de movimiento en píxeles

document.addEventListener('dragstart', (e) => e.preventDefault());

desktop.addEventListener('pointerdown', (e) => {
    const folder = e.target.closest('.folder');
    if (!folder || e.button !== 0) return;

    // Prevenimos el comportamiento por defecto solo si es un enlace, para no bloquear otros eventos.
    if (e.target.tagName === 'A') {
        e.preventDefault();
    }

    activeFolder = folder;
    pointerId = e.pointerId;
    
    startX = e.clientX;
    startY = e.clientY;

    const rect = activeFolder.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    try {
        activeFolder.setPointerCapture(pointerId);
    } catch (err) {
        console.error("Pointer capture failed:", err);
    }

    activeFolder.classList.add('dragging');

    const onPointerMove = (moveEvent) => {
        if (moveEvent.pointerId !== pointerId) return;

        let newX = moveEvent.clientX - offsetX;
        let newY = moveEvent.clientY - offsetY;

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
            activeFolder.releasePointerCapture(pointerId);
        } catch (err) {}

        activeFolder.classList.remove('dragging');

        const deltaX = Math.abs(startX - upEvent.clientX);
        const deltaY = Math.abs(startY - upEvent.clientY);

        if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
            const link = activeFolder.querySelector('a');
            if (link) {
                const preventClick = (clickEvent) => {
                    clickEvent.preventDefault();
                    clickEvent.stopImmediatePropagation();
                };
                link.addEventListener('click', preventClick, { once: true, capture: true });
            }
        } else {
            // Si no fue un arrastre, disparamos el clic en el enlace.
            const link = activeFolder.querySelector('a');
            if (link) {
                link.click();
            }
        }
        
        activeFolder = null;
    };

    desktop.addEventListener('pointermove', onPointerMove);
    desktop.addEventListener('pointerup', onPointerUp);
});

window.addEventListener('pointercancel', (e) => {
    if (!activeFolder || e.pointerId !== pointerId) return;
    
    try {
        activeFolder.releasePointerCapture(pointerId);
    } catch (err) {}
    
    activeFolder.classList.remove('dragging');
    activeFolder = null;
});

window.addEventListener('load', () => {
    document.querySelectorAll('.folder').forEach(f => {
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

