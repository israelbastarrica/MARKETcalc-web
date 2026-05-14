// ---------- Referencias a elementos ----------
const $pesos = document.getElementById('pesos');
const $dolares = document.getElementById('dolares');
const $yuanes = document.getElementById('yuanes');
const $cotizacion = document.getElementById('cotizacion');
const $tasaCny = document.getElementById('tasaCny');
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
const $comboBarValor = document.getElementById('comboBarValor');

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
let monedaActiva = 'ARS'; // se actualiza al escribir en ARS/USD/CNY

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

function formatearMoneda(numero, decimales) {
    if (!decimales) return formatearMil(numero);
    return numero.toLocaleString('es-AR', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
}

// ---------- Cálculo y render ----------
function recalcular() {
    const pesos = parseNum($pesos.value);
    const dolares = parseNum($dolares.value);
    const yuanes = parseNum($yuanes.value);
    const cotizacion = parseNum($cotizacion.value) || 1;
    const tasaCny = parseNum($tasaCny.value) || 1;
    const descuento = parseNum($descuento.value);
    const nacionalizacion = parseNum($nacionalizacion.value);

    // Solo se usa la moneda activa. El campo ARS se autocompleta con la conversión si la activa es USD o CNY.
    let bruto;
    if (monedaActiva === 'USD') {
        bruto = dolares * cotizacion;
        $pesos.value = bruto > 0 ? Math.round(bruto).toString() : '';
    } else if (monedaActiva === 'CNY') {
        bruto = yuanes / tasaCny * cotizacion;
        $pesos.value = bruto > 0 ? Math.round(bruto).toString() : '';
    } else {
        bruto = pesos;
    }
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

    // Conversión ARS → moneda activa (USD, CNY o ARS)
    const cotizacion = parseNum($cotizacion.value) || 1;
    const tasaCny = parseNum($tasaCny.value) || 1;
    let factor = 1;
    let simbolo = '$';
    let decimales = 0;
    if (monedaActiva === 'USD' && cotizacion > 0) {
        factor = 1 / cotizacion;
        simbolo = 'U$D';
        decimales = 2;
    } else if (monedaActiva === 'CNY' && cotizacion > 0) {
        factor = tasaCny / cotizacion;
        simbolo = '¥';
        decimales = 2;
    }

    $comboWrap.hidden = false;
    $comboNombre.textContent = c.combo;
    $comboDesde.textContent = `${simbolo} ${formatearMoneda(c.desde * factor, decimales)}`;
    $comboHasta.textContent = `${simbolo} ${formatearMoneda(c.hasta * factor, decimales)}`;
    $comboBarValor.textContent = `${simbolo} ${formatearMoneda(precio * factor, decimales)}`;

    const pct = Math.max(0, Math.min(100, ((precio - c.desde) / (c.hasta - c.desde)) * 100));
    $comboBarIndicator.style.left = pct + '%';
    $comboBarValor.style.left = pct + '%';
}

$segmented.forEach(btn => {
    btn.addEventListener('click', () => {
        modoCantidad = btn.dataset.modo;
        $segmented.forEach(b => b.classList.toggle('active', b === btn));
        recalcular();
    });
});

// ---------- Selección al focus + recálculo al input ----------
[$pesos, $dolares, $yuanes, $cotizacion, $tasaCny, $descuento, $nacionalizacion].forEach(input => {
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
        // Trackear última moneda usada para mostrar el rango del combo en esa moneda
        if (input === $pesos) monedaActiva = 'ARS';
        else if (input === $dolares) monedaActiva = 'USD';
        else if (input === $yuanes) monedaActiva = 'CNY';
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
    const cacheKey = `cotiUsd_${tipo}`;
    try {
        const r = await fetch(`https://dolarapi.com/v1/dolares/${tipo}`);
        const data = await r.json();
        const venta = Number(data.venta);
        if (!isNaN(venta) && venta > 0) {
            const valor = String(Math.trunc(venta));
            localStorage.setItem(cacheKey, valor);
            return valor;
        }
    } catch (e) { /* fall through */ }
    // Sin red o sin datos: usar último valor guardado
    return localStorage.getItem(cacheKey) || '0';
}

async function buscarTasaCny() {
    try {
        const r = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await r.json();
        if (data.rates && data.rates.CNY) {
            const valor = Number(data.rates.CNY).toFixed(2);
            $tasaCny.value = valor;
            localStorage.setItem('tasaCny', valor);
            recalcular();
            return;
        }
    } catch (e) { /* fall through */ }
    // Sin red: usar último valor guardado
    const guardado = localStorage.getItem('tasaCny');
    if (guardado) {
        $tasaCny.value = guardado;
        recalcular();
    }
}

// ---------- Limpiar ----------
$btnLimpiar.addEventListener('click', () => {
    $pesos.value = '';
    $dolares.value = '';
    $yuanes.value = '';
    $descuento.value = '0';
    $nacionalizacion.value = '0';
    modoCantidad = 'Unidad';
    monedaActiva = 'ARS';
    $segmented.forEach(b => b.classList.toggle('active', b.dataset.modo === 'Unidad'));
    document.activeElement && document.activeElement.blur();
    recalcular();
    seleccionarTipo('Oficial');
    buscarTasaCny();
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

// Arranque: tasa CNY + cotización USD oficial en paralelo
seleccionarTipo('Oficial');
buscarTasaCny();
