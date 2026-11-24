<?php

/**
 * calendario.example.php
 * Plantilla de configuracion para agendar evaluaciones en Google Calendar mediante
 * el Web App de Apps Script (ver service/calendar.gs).
 *
 * Copiala como `calendario.php` (ese archivo esta ignorado por git) y ajusta los valores.
 *
 *   cp backend/config/calendario.example.php backend/config/calendario.php
 */

declare(strict_types=1);

const CALENDAR_SCRIPT_URL = 'https://script.google.com/macros/s/ID_DEL_DEPLOYMENT/exec';
const CALENDAR_TOKEN = 'mismo-token-que-en-calendar.gs';
