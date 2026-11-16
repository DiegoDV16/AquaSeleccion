<?php

/**
 * Configuracion de Resend.
 * Este archivo esta ignorado por Git. No subir la API key al repositorio.
 */
return [
    'api_key' => getenv('RESEND_API_KEY') ?: 're_TU_API_KEY',
    'from' => getenv('RESEND_FROM') ?: 'AquaSeleccion <onboarding@resend.dev>',
    'analyst_fallback' => getenv('RESEND_ANALYST_EMAIL') ?: 'analista@aquachile.cl',
    'test_recipient' => getenv('RESEND_TEST_RECIPIENT') ?: '',
    'app_url' => getenv('APP_URL') ?: 'http://localhost:5173',
];
