const desktop = document.getElementById('desktop');
let activeFolder = null;
let pointerId = null;
let offsetX = 0;
let offsetY = 0;
let moved = false; 

document.addEventListener('dragstart', (e) => e.preventDefault());

desktop.addEventListener('pointerdown', (e) => {
    const folder = e.target.closest('.folder');
    if (!folder || e.button !== 0) return;

    e.preventDefault();
    activeFolder = folder;
    pointerId = e.pointerId;
    moved = false;

    const rect = activeFolder.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    try {
        activeFolder.setPointerCapture(pointerId);
    } catch (err) {
    }

    activeFolder.classList.add('dragging');
});

desktop.addEventListener('pointermove', (e) => {
    if (!activeFolder || e.pointerId !== pointerId) return;
    e.preventDefault();

    moved = true;

    let newX = e.clientX - offsetX;
    let newY = e.clientY - offsetY;

    const maxX = window.innerWidth - activeFolder.offsetWidth;
    const maxY = window.innerHeight - activeFolder.offsetHeight;

    activeFolder.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
    activeFolder.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
});

desktop.addEventListener('pointerup', (e) => {
    if (!activeFolder || e.pointerId !== pointerId) return;

    try {
        activeFolder.releasePointerCapture(pointerId);
    } catch (err) {}

    activeFolder.classList.remove('dragging');

    if (moved) {
        const draggedFolder = activeFolder;
        setTimeout(() => { moved = false; }, 0);
        setTimeout(() => { if (draggedFolder) draggedFolder.style.zIndex = ''; }, 0);
    }

    activeFolder = null;
    pointerId = null;
});

document.querySelectorAll('.folder a').forEach(link => {
    link.addEventListener('click', (e) => {
        if (moved) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    });
});

window.addEventListener('pointercancel', () => {
    if (!activeFolder) return;
    try { activeFolder.releasePointerCapture(pointerId); } catch (err) {}
    activeFolder.classList.remove('dragging');
    activeFolder = null;
    pointerId = null;
    moved = false;
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

