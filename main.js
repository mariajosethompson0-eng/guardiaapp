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
