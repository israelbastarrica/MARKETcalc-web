// ---------- Referencias a elementos ----------
const $pesos = document.getElementById('pesos');
const $dolares = document.getElementById('dolares');
const $yuanes = document.getElementById('yuanes');
const $cotizacion = document.getElementById('cotizacion');
const $cotizacionCny = document.getElementById('cotizacionCny');
const $descuento = document.getElementById('descuento');
const $nacionalizacion = document.getElementById('nacionalizacion');

const $bruto = document.getElementById('bruto');
const $recargoNac = document.getElementById('recargoNac');
const $ahorro = document.getElementById('ahorro');
const $neto = document.getElementById('neto');
const $unitario = document.getElementById('unitario');
const $unitarioWrap = document.getElementById('unitarioWrap');
const $segmented = document.querySelectorAll('.segmented .seg');

const $comboWrap = document.getElementById('comboWrap');
const $comboNombre = document.getElementById('comboNombre');
const $comboBarIndicator = document.getElementById('comboBarIndicator');
const $comboDesde = document.getElementById('comboDesde');
const $comboHasta = document.getElementById('comboHasta');

const COMBOS = [
    { desde: 1,     hasta: 2100,  combo: '2x6000' },
    { desde: 2101,  hasta: 2800,  combo: '2x8000' },
    { desde: 2801,  hasta: 3500,  combo: '2x10000' },
    { desde: 3501,  hasta: 5250,  combo: '2x15000' },
    { desde: 5251,  hasta: 7000,  combo: '2x20000' },
    { desde: 7001,  hasta: 8750,  combo: '2x25000' },
    { desde: 8751,  hasta: 10500, combo: '2x30000' },
    { desde: 10501, hasta: 14000, combo: '2x40000' },
    { desde: 14001, hasta: 17500, combo: '2x50000' },
    { desde: 17501, hasta: 21000, combo: '2x60000' },
    { desde: 21001, hasta: 28000, combo: '2x80000' },
    { desde: 28001, hasta: 35000, combo: '2x100000' }
];

const $tipoDolarBtn = document.getElementById('tipoDolarBtn');
const $tipoDolarMenu = document.getElementById('tipoDolarMenu');
const $btnLimpiar = document.getElementById('btnLimpiar');
const $themeToggle = document.getElementById('themeToggle');

let tipoDolar = 'Oficial';
let modoCantidad = 'Unidad';

// ---------- Parseo y formato ----------
function parseNum(str) {
    if (!str) return 0;
    const n = parseFloat(String(str).replace(',', '.'));
    return isNaN(n) ? 0 : n;
}

function formatearMil(numero) {
    const entero = Math.trunc(numero).toString();
    if (entero.length <= 3) return entero;
    return entero.split('').reverse().join('')
        .match(/.{1,3}/g).join('.')
        .split('').reverse().join('');
}

// ---------- Cálculo y render ----------
function recalcular() {
    const pesos = parseNum($pesos.value);
    const dolares = parseNum($dolares.value);
    const yuanes = parseNum($yuanes.value);
    const cotizacion = parseNum($cotizacion.value) || 1;
    const cotizacionCny = parseNum($cotizacionCny.value);
    const descuento = parseNum($descuento.value);
    const nacionalizacion = parseNum($nacionalizacion.value);

    const bruto = pesos + (dolares * cotizacion) + (yuanes * cotizacionCny);
    const recargoNac = bruto * (nacionalizacion / 100);
    const ahorro = bruto * (descuento / 100);
    const neto = bruto + recargoNac - ahorro;

    $bruto.textContent = formatearMil(bruto);
    $recargoNac.textContent = formatearMil(recargoNac);
    $ahorro.textContent = formatearMil(ahorro);
    $neto.textContent = formatearMil(neto);

    if (modoCantidad === 'Docena') {
        $unitario.textContent = formatearMil(neto / 12);
        $unitarioWrap.hidden = false;
    } else {
        $unitarioWrap.hidden = true;
    }

    const precioUnitario = modoCantidad === 'Docena' ? neto / 12 : neto;
    actualizarCombo(precioUnitario);
}

function actualizarCombo(precio) {
    if (precio < 1 || precio > COMBOS[COMBOS.length - 1].hasta) {
        $comboWrap.hidden = true;
        return;
    }

    const idx = COMBOS.findIndex(c => precio >= c.desde && precio <= c.hasta);
    if (idx === -1) {
        $comboWrap.hidden = true;
        return;
    }

    const c = COMBOS[idx];

    $comboWrap.hidden = false;
    $comboNombre.textContent = c.combo;
    $comboDesde.textContent = '$ ' + formatearMil(c.desde);
    $comboHasta.textContent = '$ ' + formatearMil(c.hasta);

    const pct = ((precio - c.desde) / (c.hasta - c.desde)) * 100;
    $comboBarIndicator.style.left = Math.max(0, Math.min(100, pct)) + '%';
}

$segmented.forEach(btn => {
    btn.addEventListener('click', () => {
        modoCantidad = btn.dataset.modo;
        $segmented.forEach(b => b.classList.toggle('active', b === btn));
        recalcular();
    });
});

// ---------- Selección al focus + recálculo al input ----------
[$pesos, $dolares, $yuanes, $cotizacion, $cotizacionCny, $descuento, $nacionalizacion].forEach(input => {
    input.addEventListener('focus', () => {
        // Pequeño delay para que selectionStart funcione en móvil
        setTimeout(() => input.select(), 0);
    });
    input.addEventListener('input', () => {
        // Replicar la regla: si empieza con "0" + dígito (no decimal), quitar el 0
        if (input === $descuento || input === $nacionalizacion) {
            const v = input.value;
            if (v.length > 1 && v.startsWith('0') && !v.startsWith('0.') && !v.startsWith('0,')) {
                input.value = v.replace(/^0/, '');
            }
        }
        recalcular();
    });
});

// ---------- Dropdown tipo de dólar ----------
$tipoDolarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    $tipoDolarMenu.hidden = !$tipoDolarMenu.hidden;
});

document.addEventListener('click', (e) => {
    if (!$tipoDolarMenu.contains(e.target) && e.target !== $tipoDolarBtn) {
        $tipoDolarMenu.hidden = true;
    }
});

async function seleccionarTipo(id) {
    tipoDolar = id;
    $tipoDolarMenu.hidden = true;

    if (id === 'Manual') {
        $cotizacion.disabled = false;
        $tipoDolarBtn.textContent = `Tipo de Cambio: ${id}`;
    } else {
        $cotizacion.disabled = true;
        $tipoDolarBtn.textContent = 'Buscando...';
        const valor = await buscarDolar(id.toLowerCase());
        $cotizacion.value = valor;
        $tipoDolarBtn.textContent = `Tipo de Cambio: ${id}`;
        recalcular();
    }
}

$tipoDolarMenu.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => seleccionarTipo(btn.dataset.tipo));
});

async function buscarDolar(tipo) {
    try {
        const r = await fetch(`https://dolarapi.com/v1/dolares/${tipo}`);
        const data = await r.json();
        const venta = Number(data.venta);
        return isNaN(venta) ? '0' : String(Math.trunc(venta));
    } catch (e) {
        return '0';
    }
}

async function buscarYuan() {
    try {
        const r = await fetch('https://dolarapi.com/v1/cotizaciones/cny');
        const data = await r.json();
        const venta = Number(data.venta);
        if (isNaN(venta) || venta <= 0) return;
        $cotizacionCny.value = venta.toFixed(2);
        recalcular();
    } catch (e) { /* sin red, queda 0 y el usuario lo carga a mano */ }
}

// ---------- Limpiar ----------
$btnLimpiar.addEventListener('click', () => {
    $pesos.value = '';
    $dolares.value = '';
    $yuanes.value = '';
    $descuento.value = '0';
    $nacionalizacion.value = '0';
    modoCantidad = 'Unidad';
    $segmented.forEach(b => b.classList.toggle('active', b.dataset.modo === 'Unidad'));
    document.activeElement && document.activeElement.blur();
    recalcular();
    seleccionarTipo('Oficial');
    buscarYuan();
});

// ---------- Theme toggle ----------
$themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark', $themeToggle.checked);
});

// ---------- Tap fuera = quitar focus ----------
document.addEventListener('click', (e) => {
    const enInput = e.target.closest('input, button, .menu');
    if (!enInput) {
        document.activeElement && document.activeElement.blur();
    }
});

// Arranque: traer cotización oficial y yuan
seleccionarTipo('Oficial');
buscarYuan();
