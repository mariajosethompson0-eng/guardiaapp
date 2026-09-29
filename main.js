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
