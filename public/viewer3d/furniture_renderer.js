// furniture_renderer.js — Three.js parametric furniture renderer
// All inputs in mm. Scale = 0.01 → 1800mm = 18 Three.js units.

var SCALE = 0.01;
function u(mm) { return mm * SCALE; }

function createBox(w, h, d, colorHex) {
    var geo = new THREE.BoxGeometry(u(w), u(h), u(d));
    var mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(colorHex) });
    var mesh = new THREE.Mesh(geo, mat);
    var edges = new THREE.EdgesGeometry(geo);
    var lineMat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15 });
    mesh.add(new THREE.LineSegments(edges, lineMat));
    return mesh;
}

function addPiece(scene, pieces, w, h, d, colorHex, cx, cy, cz) {
    var mesh = createBox(w, h, d, colorHex);
    mesh.position.set(u(cx), u(cy), u(cz));
    mesh.userData.basePosition = mesh.position.clone();
    scene.add(mesh);
    pieces.push(mesh);
}

function renderClosetBase(cfg, scene, pieces) {
    var W = cfg.widthMm, H = cfg.heightMm, D = cfg.depthMm, T = cfg.thicknessMm;
    var iw = W - 2 * T, ih = H - 2 * T;
    var c = cfg.colorHex;
    addPiece(scene, pieces, T, H, D, c, -(W/2 - T/2), 0, 0);
    addPiece(scene, pieces, T, H, D, c, W/2 - T/2, 0, 0);
    addPiece(scene, pieces, iw, T, D, c, 0, H/2 - T/2, 0);
    addPiece(scene, pieces, iw, T, D, c, 0, -(H/2 - T/2), 0);
    for (var i = 1; i <= cfg.shelves; i++) {
        var y = -H/2 + T + ih * i / (cfg.shelves + 1);
        addPiece(scene, pieces, iw, T, D, c, 0, y, 0);
    }
}

function renderDespensero(cfg, scene, pieces) {
    renderClosetBase(cfg, scene, pieces);
    var W = cfg.widthMm, H = cfg.heightMm, D = cfg.depthMm, T = cfg.thicknessMm;
    var iw = W - 2 * T;
    if (cfg.doors > 0) {
        var dw = (iw - 2) / cfg.doors;
        for (var i = 0; i < cfg.doors; i++) {
            var x = -iw/2 + dw * (i + 0.5);
            addPiece(scene, pieces, dw - 2, H - 4, 18, cfg.colorHex, x, 0, D/2 + 10);
        }
    }
}

function renderEscritorio(cfg, scene, pieces) {
    var W = cfg.widthMm, H = cfg.heightMm, D = cfg.depthMm, T = cfg.thicknessMm;
    var iw = W - 2 * T, c = cfg.colorHex;
    addPiece(scene, pieces, W, T, D, c, 0, H/2 - T/2, 0);
    addPiece(scene, pieces, T, H, D, c, -(W/2 - T/2), 0, 0);
    addPiece(scene, pieces, T, H, D, c, W/2 - T/2, 0, 0);
    var usable = H - T;
    for (var i = 1; i <= cfg.shelves; i++) {
        var y = H/2 - T - usable * i / (cfg.shelves + 1);
        addPiece(scene, pieces, iw, T, D, c, 0, y, 0);
    }
}

function renderMesaComedor(cfg, scene, pieces) {
    var W = cfg.widthMm, H = cfg.heightMm, D = cfg.depthMm, c = cfg.colorHex;
    var legH = H - 18 - 80;
    addPiece(scene, pieces, W, 18, D, c, 0, H/2 - 9, 0);
    addPiece(scene, pieces, W-200, 80, 18, c, 0, H/2-58, -(D/2-30));
    addPiece(scene, pieces, W-200, 80, 18, c, 0, H/2-58, D/2-30);
    addPiece(scene, pieces, 18, 80, D-200, c, -(W/2-30), H/2-58, 0);
    addPiece(scene, pieces, 18, 80, D-200, c, W/2-30, H/2-58, 0);
    if (legH > 0) {
        var lx = W/2-30, lz = D/2-30, ly = H/2-18-80-legH/2;
        addPiece(scene, pieces, 40, legH, 40, c, -lx, ly, -lz);
        addPiece(scene, pieces, 40, legH, 40, c,  lx, ly, -lz);
        addPiece(scene, pieces, 40, legH, 40, c, -lx, ly,  lz);
        addPiece(scene, pieces, 40, legH, 40, c,  lx, ly,  lz);
    }
}

function renderCocinaModular(cfg, scene, pieces) {
    renderClosetBase(cfg, scene, pieces);
    var W = cfg.widthMm, H = cfg.heightMm, D = cfg.depthMm, T = cfg.thicknessMm, c = cfg.colorHex;
    var iw = W - 2 * T;
    if (cfg.doors > 0) {
        var dw = (iw - 2) / cfg.doors;
        var doorH = H * 0.55;
        for (var i = 0; i < cfg.doors; i++) {
            var x = -iw/2 + dw * (i + 0.5);
            addPiece(scene, pieces, dw - 2, doorH, 18, c, x, -(H/2 - doorH/2 - T), D/2+10);
        }
    }
    if (cfg.drawers > 0) {
        var drawerH = (H * 0.4) / cfg.drawers;
        for (var j = 0; j < cfg.drawers; j++) {
            var dy = H/2 - T - drawerH * (j + 0.5);
            addPiece(scene, pieces, iw - 4, drawerH - 4, 18, c, 0, dy, D/2+10);
        }
    }
}

function renderCajonera(cfg, scene, pieces) {
    var W = cfg.widthMm, H = cfg.heightMm, D = cfg.depthMm, T = cfg.thicknessMm, c = cfg.colorHex;
    var iw = W - 2 * T, ih = H - 2 * T;
    addPiece(scene, pieces, T, H, D, c, -(W/2 - T/2), 0, 0);
    addPiece(scene, pieces, T, H, D, c, W/2 - T/2, 0, 0);
    addPiece(scene, pieces, iw, T, D, c, 0, H/2 - T/2, 0);
    addPiece(scene, pieces, iw, T, D, c, 0, -(H/2 - T/2), 0);
    if (cfg.drawers > 0) {
        var drawerH = ih / cfg.drawers;
        for (var i = 1; i < cfg.drawers; i++) {
            var y = -H/2 + T + drawerH * i;
            addPiece(scene, pieces, iw, T, D * 0.85, c, 0, y, 0);
        }
        for (var j = 0; j < cfg.drawers; j++) {
            var fy = -H/2 + T + drawerH * (j + 0.5);
            addPiece(scene, pieces, iw - 4, drawerH - 8, 18, c, 0, fy, D/2+10);
        }
    }
}

function renderVelador(cfg, scene, pieces) {
    renderClosetBase(cfg, scene, pieces);
    var H = cfg.heightMm, D = cfg.depthMm, T = cfg.thicknessMm, c = cfg.colorHex;
    var iw = cfg.widthMm - 2 * T;
    if (cfg.doors > 0) {
        var doorH = (H - 2*T) / cfg.doors;
        for (var i = 0; i < cfg.doors; i++) {
            var y = H/2 - T - doorH * (i + 0.5);
            addPiece(scene, pieces, iw - 4, doorH - 4, 18, c, 0, y, D/2+10);
        }
    }
}

function renderFurniture(cfg, scene, pieces) {
    switch (cfg.type) {
        case 'CLOSET_CORRIDO': case 'CLOSET_ESQUINERO':
        case 'RACK_TV': case 'ESTANTERIA':
            renderClosetBase(cfg, scene, pieces); break;
        case 'DESPENSERO':
            renderDespensero(cfg, scene, pieces); break;
        case 'ESCRITORIO':
            renderEscritorio(cfg, scene, pieces); break;
        case 'MESA_COMEDOR':
            renderMesaComedor(cfg, scene, pieces); break;
        case 'COCINA_MODULAR':
            renderCocinaModular(cfg, scene, pieces); break;
        case 'CAJONERA':
            renderCajonera(cfg, scene, pieces); break;
        case 'VELADOR':
            renderVelador(cfg, scene, pieces); break;
        default:
            renderClosetBase(cfg, scene, pieces);
    }
}
