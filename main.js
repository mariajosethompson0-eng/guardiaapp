/**
 * GuardiasApp · lógica de la interfaz
 * Roles: administrador · recepcionista · medico
 * Los datos se guardan en localStorage y la sesión en sessionStorage.
 */
(() => {
    'use strict';

    /* ---------- Configuración ---------- */
    const CLAVE_DATOS = 'guardiasapp.datos.v1';
    const CLAVE_SESION = 'guardiasapp.sesion';
    const SUELDO_BASE = 2500;

    // Demostración académica: en un sistema real la validación va en el servidor.
    const USUARIOS = {
        admin: { clave: '1234', rol: 'administrador', nombre: 'Administrador' },
        recepcion: { clave: '1234', rol: 'recepcionista', nombre: 'Recepción' },
        medico: { clave: '1234', rol: 'medico', nombre: 'Médico' }
    };

    const PERMISOS = {
        admitir: ['recepcionista'],
        eliminarPaciente: ['recepcionista'],
        atender: ['recepcionista', 'medico'],
        cambiarGuardia: ['medico'],
        gestionarMedicos: ['administrador'],
        calculadora: ['administrador']
    };

    const PRIORIDAD = { Rojo: 0, Amarillo: 1, Verde: 2 };
    const TRIAGE_UI = {
        Rojo: { clase: 'text-bg-danger', icono: '🔴' },
        Amarillo: { clase: 'text-bg-warning', icono: '🟡' },
        Verde: { clase: 'text-bg-success', icono: '🟢' }
    };
    const ESTADO_UI = {
        'En Espera': 'text-bg-warning',
        'En Atención': 'text-bg-info',
        'Atendido': 'text-bg-success'
    };
    const VALOR_HORA = { Facultativo: 28.5, MIR: 18, Enfermeria: 22 };

    /* ---------- Estado ---------- */
    let datos = cargarDatos();
    let usuario = leerSesion();

    const $ = (id) => document.getElementById(id);
    const formatoMoneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

    /* ---------- Utilidades ---------- */
    const esc = (texto) => String(texto).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

    const puede = (accion) => Boolean(usuario) && PERMISOS[accion].includes(usuario.rol);
    const esHoy = (marca) => Boolean(marca) && new Date(marca).toDateString() === new Date().toDateString();
    const hora = (marca) => new Date(marca).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    function horaDeHoy(h, m) {
        const fecha = new Date();
        fecha.setHours(h, m, 0, 0);
        return fecha.getTime();
    }

    /* ---------- Persistencia ---------- */
    function datosIniciales() {
        return {
            pacientes: [
                { id: 1, dni: '38123456', nombre: 'María Thompson', motivo: 'Dolor precordial con disnea', triage: 'Rojo', estado: 'En Espera', ingreso: horaDeHoy(9, 15), inicio: null, fin: null },
                { id: 2, dni: '40987654', nombre: 'Juan Pérez', motivo: 'Fiebre alta y cefalea persistente', triage: 'Amarillo', estado: 'En Atención', ingreso: horaDeHoy(9, 30), inicio: horaDeHoy(9, 42), fin: null },
                { id: 3, dni: '42111222', nombre: 'Lucas Benítez', motivo: 'Traumatismo leve en tobillo derecho', triage: 'Verde', estado: 'En Espera', ingreso: horaDeHoy(9, 45), inicio: null, fin: null }
            ],
            medicos: [
                { id: 1, nombre: 'Dr. Carlos Mendoza', especialidad: 'Cardiología', matricula: '45211', activo: true },
                { id: 2, nombre: 'Dra. Valeria Ríos', especialidad: 'Clínica Médica', matricula: '58920', activo: false }
            ]
        };
    }

    function cargarDatos() {
        try {
            const guardado = JSON.parse(localStorage.getItem(CLAVE_DATOS));
            if (guardado && Array.isArray(guardado.pacientes) && Array.isArray(guardado.medicos)) return guardado;
        } catch (error) { /* datos ausentes o corruptos: se usan los de ejemplo */ }
        return datosIniciales();
    }

    function guardarDatos() {
        try { localStorage.setItem(CLAVE_DATOS, JSON.stringify(datos)); } catch (error) { /* almacenamiento no disponible */ }
    }

    function leerSesion() {
        try {
            const clave = sessionStorage.getItem(CLAVE_SESION);
            return clave && USUARIOS[clave] ? { usuario: clave, ...USUARIOS[clave] } : null;
        } catch (error) { return null; }
    }

    /* ---------- Avisos y diálogos ---------- */
    function avisar(mensaje, tipo = 'success') {
        const toast = $('toastApp');
        toast.className = `toast align-items-center border-0 text-bg-${tipo}`;
        $('toastTexto').textContent = mensaje;
        bootstrap.Toast.getOrCreateInstance(toast).show();
    }

    function exigir(accion) {
        if (!usuario) { avisar('Iniciá sesión para realizar esta acción.', 'warning'); return false; }
        if (!puede(accion)) { avisar('Tu rol no tiene permiso para esta acción.', 'danger'); return false; }
        return true;
    }

    function confirmar(texto) {
        return new Promise((resolver) => {
            const el = $('modalConfirmar');
            const modal = bootstrap.Modal.getOrCreateInstance(el);
            const control = new AbortController();
            let aceptado = false;
            $('confirmarTexto').textContent = texto;
            $('confirmarAceptar').addEventListener('click', () => { aceptado = true; modal.hide(); }, { signal: control.signal });
            el.addEventListener('hidden.bs.modal', () => { control.abort(); resolver(aceptado); }, { once: true });
            modal.show();
        });
    }

    function validar(form) {
        form.classList.add('was-validated');
        return form.checkValidity();
    }

    function limpiarForm(form) {
        form.reset();
        form.classList.remove('was-validated');
        form.querySelectorAll('.is-invalid').forEach((c) => c.classList.remove('is-invalid'));
    }

    /* ---------- Permisos en la interfaz ---------- */
    function aplicarPermisos() {
        document.querySelectorAll('[data-role]').forEach((el) => {
            const roles = el.dataset.role.split(' ');
            el.classList.toggle('d-none', !(usuario && roles.includes(usuario.rol)));
        });

        $('navAuth').classList.toggle('d-none', Boolean(usuario));
        $('navSesion').classList.toggle('d-none', !usuario);
        $('rolActual').textContent = usuario ? usuario.nombre : '';

        // Sin acceso a retribuciones se vuelve a la sala de espera
        if (!puede('calculadora') && $('btnTabCalculadora').classList.contains('active')) {
            bootstrap.Tab.getOrCreateInstance($('btnTabEspera')).show();
        }

        // Con el formulario de admisión oculto, el listado ocupa todo el ancho
        renderPacientes();
        renderMedicos();
    }

    /* ---------- Pacientes ---------- */
    function ordenarPacientes(lista) {
        const activos = lista.filter((p) => p.estado !== 'Atendido')
            .sort((a, b) => PRIORIDAD[a.triage] - PRIORIDAD[b.triage] || a.ingreso - b.ingreso);
        const atendidos = lista.filter((p) => p.estado === 'Atendido').sort((a, b) => b.fin - a.fin);
        return [...activos, ...atendidos];
    }

    function accionesPaciente(p) {
        if (!usuario) return '<span class="small text-secondary">Iniciá sesión</span>';
        let html = '';
        if (puede('atender')) {
            if (p.estado === 'En Espera') {
                html += `<button type="button" class="btn btn-sm btn-outline-info" data-action="atender" data-id="${p.id}"><i class="bi bi-play-fill me-1" aria-hidden="true"></i>Atender</button>`;
            } else if (p.estado === 'En Atención') {
                html += `<button type="button" class="btn btn-sm btn-outline-success" data-action="finalizar" data-id="${p.id}"><i class="bi bi-check2-all me-1" aria-hidden="true"></i>Finalizar</button>`;
            } else {
                html += '<span class="small text-success"><i class="bi bi-check-circle-fill me-1" aria-hidden="true"></i>Atendido</span>';
            }
        } else {
            html += '<span class="small text-secondary">Solo lectura</span>';
        }
        if (puede('eliminarPaciente')) {
            html += ` <button type="button" class="btn btn-sm btn-outline-danger ms-1" data-action="eliminar-paciente" data-id="${p.id}" aria-label="Eliminar a ${esc(p.nombre)}"><i class="bi bi-trash-fill" aria-hidden="true"></i></button>`;
        }
        return html;
    }

    function renderPacientes() {
        const cuerpo = $('tablaPacientes');
        if (datos.pacientes.length === 0) {
            cuerpo.innerHTML = '<tr><td colspan="5" class="text-center text-secondary py-4"><i class="bi bi-inbox fs-3 d-block mb-1" aria-hidden="true"></i>No hay pacientes en la sala.</td></tr>';
        } else {
            cuerpo.innerHTML = ordenarPacientes(datos.pacientes).map((p) => `
                <tr>
                    <td class="text-secondary fw-semibold">${hora(p.ingreso)}</td>
                    <td>
                        <div class="fw-semibold">${esc(p.nombre)}</div>
                        <small class="text-secondary d-block">DNI ${esc(p.dni)}</small>
                        <small class="text-secondary">${esc(p.motivo)}</small>
                    </td>
                    <td><span class="badge rounded-pill ${TRIAGE_UI[p.triage].clase}">${TRIAGE_UI[p.triage].icono} ${p.triage}</span></td>
                    <td><span class="badge ${ESTADO_UI[p.estado]}">${p.estado}</span></td>
                    <td class="text-end text-nowrap">${accionesPaciente(p)}</td>
                </tr>`).join('');
        }
        actualizarIndicadores();
    }

    function actualizarIndicadores() {
        const { pacientes, medicos } = datos;
        const enEspera = pacientes.filter((p) => p.estado === 'En Espera');
        const activos = pacientes.filter((p) => p.estado !== 'Atendido').length;
        const esperasHoy = pacientes.filter((p) => p.inicio && esHoy(p.ingreso)).map((p) => p.inicio - p.ingreso);
        const horaActual = new Date().getHours();

        $('navCountRojo').textContent = enEspera.filter((p) => p.triage === 'Rojo').length;
        $('navCountEspera').textContent = enEspera.length;
        $('navCountMedicos').textContent = medicos.filter((m) => m.activo).length;
        $('contadorPacientes').textContent = `${activos} ${activos === 1 ? 'activo' : 'activos'}`;
        $('statAtendidos').textContent = pacientes.filter((p) => p.estado === 'Atendido' && esHoy(p.fin)).length;
        $('statTiempo').textContent = esperasHoy.length
            ? `${Math.round(esperasHoy.reduce((a, b) => a + b, 0) / esperasHoy.length / 60000)} min`
            : '—';
        $('statTurno').textContent = horaActual >= 6 && horaActual < 14 ? 'mañana' : horaActual < 22 && horaActual >= 14 ? 'tarde' : 'noche';
        $('statActualizado').textContent = hora(Date.now());
    }

    function cambiarEstado(id, estado) {
        if (!exigir('atender')) return;
        const paciente = datos.pacientes.find((p) => p.id === id);
        if (!paciente) return;
        paciente.estado = estado;
        if (estado === 'En Atención') paciente.inicio = Date.now();
        if (estado === 'Atendido') paciente.fin = Date.now();
        guardarDatos();
        renderPacientes();
        avisar(`${paciente.nombre}: ${estado.toLowerCase()}.`);
    }

    async function eliminarPaciente(id) {
        if (!exigir('eliminarPaciente')) return;
        const paciente = datos.pacientes.find((p) => p.id === id);
        if (!paciente || !(await confirmar(`¿Eliminar a ${paciente.nombre} de la lista?`))) return;
        datos.pacientes = datos.pacientes.filter((p) => p.id !== id);
        guardarDatos();
        renderPacientes();
        avisar('Paciente eliminado de la lista.');
    }

    function registrarPaciente(evento) {
        evento.preventDefault();
        const form = evento.currentTarget;
        if (!exigir('admitir')) return;

        const dni = $('dni').value.trim();
        const repetido = datos.pacientes.some((p) => p.dni === dni && p.estado !== 'Atendido');
        $('dni').setCustomValidity(repetido ? 'duplicado' : '');
        $('dniError').textContent = repetido ? 'Ese DNI ya está en la sala de espera.' : 'Ingresá 7 u 8 dígitos, sin puntos.';
        if (!validar(form)) return;

        datos.pacientes.push({
            id: Date.now(),
            dni,
            nombre: $('nombre').value.trim(),
            motivo: $('motivo').value.trim(),
            triage: $('triage').value,
            estado: 'En Espera',
            ingreso: Date.now(),
            inicio: null,
            fin: null
        });
        guardarDatos();
        renderPacientes();
        avisar(`${$('nombre').value.trim()} registrado con triage ${$('triage').value}.`);
        limpiarForm(form);
    }

    /* ---------- Médicos ---------- */
    function renderMedicos() {
        $('contenedorMedicos').innerHTML = datos.medicos.map((m) => {
            let boton = '';
            if (puede('cambiarGuardia')) {
                boton = `<button type="button" class="btn btn-sm btn-outline-secondary rounded-pill" data-action="alternar-medico" data-id="${m.id}">Cambiar estado</button>`;
            } else if (puede('gestionarMedicos')) {
                boton = `<button type="button" class="btn btn-sm btn-outline-danger rounded-pill" data-action="baja-medico" data-id="${m.id}">Dar de baja</button>`;
            }
            return `
                <div class="col-12 col-md-6 col-lg-4">
                    <article class="card h-100 bg-body-tertiary rounded-4 border-start border-4 ${m.activo ? 'border-success' : 'border-warning'}">
                        <div class="card-body">
                            <div class="d-flex align-items-center gap-3 mb-3">
                                <span class="bg-primary-subtle text-primary-emphasis rounded-circle p-3 lh-1"><i class="bi bi-person-fill fs-3" aria-hidden="true"></i></span>
                                <div>
                                    <h3 class="h6 fw-bold mb-0">${esc(m.nombre)}</h3>
                                    <small class="text-secondary">${esc(m.especialidad)} · Mat. ${esc(m.matricula)}</small>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge ${m.activo ? 'text-bg-success' : 'text-bg-warning'}">${m.activo ? 'En guardia activa' : 'En descanso'}</span>
                                ${boton}
                            </div>
                        </div>
                    </article>
                </div>`;
        }).join('');
        actualizarIndicadores();
    }

    function alternarMedico(id) {
        if (!exigir('cambiarGuardia')) return;
        const medico = datos.medicos.find((m) => m.id === id);
        if (!medico) return;
        medico.activo = !medico.activo;
        guardarDatos();
        renderMedicos();
        avisar(`${medico.nombre} está ${medico.activo ? 'en guardia activa' : 'en descanso'}.`);
    }

    async function darDeBaja(id) {
        if (!exigir('gestionarMedicos')) return;
        const medico = datos.medicos.find((m) => m.id === id);
        if (!medico || !(await confirmar(`¿Dar de baja a ${medico.nombre}?`))) return;
        datos.medicos = datos.medicos.filter((m) => m.id !== id);
        guardarDatos();
        renderMedicos();
        avisar(`${medico.nombre} fue dado de baja.`);
    }

    function guardarMedico(evento) {
        evento.preventDefault();
        const form = evento.currentTarget;
        if (!exigir('gestionarMedicos') || !validar(form)) return;

        const nombre = $('medNombre').value.trim();
        const matricula = $('medMatricula').value.trim();
        if (datos.medicos.some((m) => m.matricula === matricula)) {
            avisar('Ya existe un profesional con esa matrícula.', 'danger');
            return;
        }
        datos.medicos.push({ id: Date.now(), nombre, especialidad: $('medEspecialidad').value.trim(), matricula, activo: true });
        guardarDatos();
        renderMedicos();
        bootstrap.Modal.getInstance($('modalMedico')).hide();
        limpiarForm(form);
        avisar(`${nombre} se incorporó al equipo.`);
    }

    /* ---------- Sesión ---------- */
    function iniciarSesion(evento) {
        evento.preventDefault();
        const form = evento.currentTarget;
        const clave = $('loginUser').value.trim().toLowerCase();
        const cuenta = USUARIOS[clave];
        const valida = Boolean(cuenta) && cuenta.clave === $('loginPass').value;

        $('loginPass').classList.toggle('is-invalid', !valida);
        if (!valida) return;

        usuario = { usuario: clave, ...cuenta };
        try { sessionStorage.setItem(CLAVE_SESION, clave); } catch (error) { /* la sesión dura hasta recargar */ }
        bootstrap.Modal.getInstance($('modalLogin')).hide();
        limpiarForm(form);
        aplicarPermisos();
        avisar(`Sesión iniciada como ${cuenta.nombre}.`);
    }

    function cerrarSesion() {
        usuario = null;
        try { sessionStorage.removeItem(CLAVE_SESION); } catch (error) { /* sin sesión guardada */ }
        aplicarPermisos();
        avisar('Sesión cerrada.', 'secondary');
    }

    /* ---------- Calculadora ---------- */
    function calcularRetribucion() {
        const guardias = Number($('cantGuardias').value) || 0;
        const duracion = Number($('duracion').value) || 0;
        const precio = Math.max(Number($('precioHora').value) || 0, 0);
        const horas = guardias * duracion;
        const complemento = horas * precio;

        $('cantGuardiasVal').textContent = guardias;
        $('calcHoras').textContent = `${horas} h`;
        $('calcBase').textContent = formatoMoneda.format(SUELDO_BASE);
        $('calcComplemento').textContent = formatoMoneda.format(complemento);
        $('calcTotal').textContent = formatoMoneda.format(SUELDO_BASE + complemento);
    }

    function abrirCalculadora() {
        if (!exigir('calculadora')) return;
        bootstrap.Tab.getOrCreateInstance($('btnTabCalculadora')).show();
        $('sec-espera').scrollIntoView({ behavior: 'smooth' });
    }

    /* ---------- Eventos ---------- */
    const ACCIONES = {
        atender: (id) => cambiarEstado(id, 'En Atención'),
        finalizar: (id) => cambiarEstado(id, 'Atendido'),
        'eliminar-paciente': eliminarPaciente,
        'alternar-medico': alternarMedico,
        'baja-medico': darDeBaja,
        'nuevo-medico': () => { if (exigir('gestionarMedicos')) bootstrap.Modal.getOrCreateInstance($('modalMedico')).show(); },
        'abrir-calculadora': abrirCalculadora,
        logout: cerrarSesion
    };

    function iniciar() {
        document.addEventListener('click', (evento) => {
            const boton = evento.target.closest('[data-action]');
            const accion = boton && ACCIONES[boton.dataset.action];
            if (accion) accion(Number(boton.dataset.id));
        });

        $('formAdmision').addEventListener('submit', registrarPaciente);
        $('formLogin').addEventListener('submit', iniciarSesion);
        $('formMedico').addEventListener('submit', guardarMedico);
        $('dni').addEventListener('input', () => $('dni').setCustomValidity(''));
        $('loginPass').addEventListener('input', () => $('loginPass').classList.remove('is-invalid'));

        $('perfil').addEventListener('change', () => {
            $('precioHora').value = VALOR_HORA[$('perfil').value].toFixed(2);
            calcularRetribucion();
        });
        ['cantGuardias', 'duracion', 'precioHora'].forEach((id) => $(id).addEventListener('input', calcularRetribucion));

        calcularRetribucion();
        aplicarPermisos();
        setInterval(actualizarIndicadores, 60000);
    }

    document.addEventListener('DOMContentLoaded', iniciar);
})();
