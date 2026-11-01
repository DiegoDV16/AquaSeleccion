<?php

/**
 * docx.php
 * Conversion basica de un documento Word (.docx) a HTML para previsualizarlo
 * dentro de la aplicacion. No usa la extension zip de PHP: lee el paquete
 * (que es un ZIP) con zlib, extrae word/document.xml y transforma parrafos,
 * runs y tablas a HTML seguro.
 */

declare(strict_types=1);

const DOCX_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

/**
 * Lee un entero little-endian de un buffer sin emitir warnings si el archivo
 * esta truncado.
 */
function leerEnteroZip(string $datos, int $posicion, int $largo): int
{
    $parte = substr($datos, $posicion, $largo);

    if (strlen($parte) !== $largo) {
        return 0;
    }

    $valor = @unpack($largo === 2 ? 'v' : 'V', $parte);

    return $valor === false ? 0 : $valor[1];
}

/**
 * Extrae un archivo del ZIP de un DOCX usando el directorio central.
 * Devuelve null si el archivo no existe o no se puede descomprimir.
 */
function extraerArchivoDocx(string $ruta, string $buscado): ?string
{
    $datos = file_get_contents($ruta);

    if ($datos === false || $datos === '') {
        return null;
    }

    $eocd = strrpos($datos, "PK\x05\x06");

    if ($eocd === false) {
        return null;
    }

    $totalEntradas = leerEnteroZip($datos, $eocd + 10, 2);
    $inicioCentral = leerEnteroZip($datos, $eocd + 16, 4);

    if ($totalEntradas < 1 || $inicioCentral < 1 || $inicioCentral >= strlen($datos)) {
        return null;
    }

    $posicion = $inicioCentral;

    for ($indice = 0; $indice < $totalEntradas; $indice++) {
        if ($posicion + 46 > strlen($datos) || substr($datos, $posicion, 4) !== "PK\x01\x02") {
            return null;
        }

        $metodo = leerEnteroZip($datos, $posicion + 10, 2);
        $tamanoComprimido = leerEnteroZip($datos, $posicion + 20, 4);
        $largoNombre = leerEnteroZip($datos, $posicion + 28, 2);
        $largoExtra = leerEnteroZip($datos, $posicion + 30, 2);
        $largoComentario = leerEnteroZip($datos, $posicion + 32, 2);
        $inicioLocal = leerEnteroZip($datos, $posicion + 42, 4);
        $nombre = substr($datos, $posicion + 46, $largoNombre);

        if (strtolower($nombre) === strtolower($buscado)) {
            if ($inicioLocal + 30 > strlen($datos) || substr($datos, $inicioLocal, 4) !== "PK\x03\x04") {
                return null;
            }

            $nombreLocal = leerEnteroZip($datos, $inicioLocal + 26, 2);
            $extraLocal = leerEnteroZip($datos, $inicioLocal + 28, 2);
            $inicioDatos = $inicioLocal + 30 + $nombreLocal + $extraLocal;

            if ($tamanoComprimido < 1 || $inicioDatos + $tamanoComprimido > strlen($datos)) {
                return null;
            }

            $comprimido = substr($datos, $inicioDatos, $tamanoComprimido);

            if ($metodo === 0) {
                return $comprimido;
            }

            if ($metodo === 8) {
                $descomprimido = @gzinflate($comprimido);

                return $descomprimido === false ? null : $descomprimido;
            }

            return null;
        }

        $posicion += 46 + $largoNombre + $largoExtra + $largoComentario;
    }

    return null;
}

/**
 * Convierte un DOCX a un fragmento HTML seguro para mostrar en el visor.
 */
function docxAHtml(string $ruta): string
{
    $xml = extraerArchivoDocx($ruta, 'word/document.xml');

    if ($xml === null) {
        throw new RuntimeException('No se pudo leer el contenido del documento Word.');
    }

    $documento = new DOMDocument();
    $anterior = libxml_use_internal_errors(true);
    $cargado = $documento->loadXML($xml, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING);
    libxml_clear_errors();
    libxml_use_internal_errors($anterior);

    if (!$cargado) {
        throw new RuntimeException('El documento Word no tiene un XML valido.');
    }

    $xpath = new DOMXPath($documento);
    $xpath->registerNamespace('w', DOCX_NS);
    $cuerpo = $xpath->query('/w:document/w:body')->item(0);

    if (!$cuerpo instanceof DOMElement) {
        throw new RuntimeException('El documento Word no tiene cuerpo.');
    }

    $html = '';

    foreach ($cuerpo->childNodes as $nodo) {
        if (!$nodo instanceof DOMElement) {
            continue;
        }

        if ($nodo->localName === 'p') {
            $html .= parrafoDocxAHtml($nodo, $xpath);
        } elseif ($nodo->localName === 'tbl') {
            $html .= tablaDocxAHtml($nodo, $xpath);
        }
    }

    if (trim($html) === '') {
        $html = '<p class="text-muted">El documento no contiene texto previsualizable.</p>';
    }

    return $html;
}

/**
 * Convierte un parrafo Word a HTML.
 */
function parrafoDocxAHtml(DOMElement $parrafo, DOMXPath $xpath): string
{
    $estiloNodo = $xpath->query('./w:pPr/w:pStyle/@w:val', $parrafo)->item(0);
    $estilo = $estiloNodo instanceof DOMAttr ? (string) $estiloNodo->nodeValue : '';

    $alineacionNodo = $xpath->query('./w:pPr/w:jc/@w:val', $parrafo)->item(0);
    $alineacion = $alineacionNodo instanceof DOMAttr ? (string) $alineacionNodo->nodeValue : '';
    $claseAlineacion = match ($alineacion) {
        'center' => 'text-center',
        'right', 'end' => 'text-end',
        'both', 'justify' => 'text-justify',
        default => '',
    };

    $esLista = $xpath->query('./w:pPr/w:numPr', $parrafo)->length > 0;
    $contenido = runsDocxAHtml($parrafo, $xpath);
    $textoLimpio = trim(strip_tags($contenido));

    if ($textoLimpio === '' && !$esLista) {
        return '<p class="mb-2">&nbsp;</p>';
    }

    $clases = trim('mb-2 ' . $claseAlineacion . ($esLista ? ' ms-3' : ''));

    if (stripos($estilo, 'Heading1') !== false || stripos($estilo, 'Title') !== false) {
        return '<h3 class="' . trim($claseAlineacion) . '">' . $contenido . '</h3>';
    }

    if (stripos($estilo, 'Heading2') !== false) {
        return '<h4 class="' . trim($claseAlineacion) . '">' . $contenido . '</h4>';
    }

    if ($esLista) {
        return '<p class="' . $clases . '">&#8226; ' . $contenido . '</p>';
    }

    return '<p class="' . $clases . '">' . $contenido . '</p>';
}

/**
 * Recorre los runs de un parrafo y devuelve el HTML con formato basico.
 */
function runsDocxAHtml(DOMElement $parrafo, DOMXPath $xpath): string
{
    $html = '';

    foreach ($xpath->query('.//w:r', $parrafo) as $run) {
        if (!$run instanceof DOMElement) {
            continue;
        }

        $texto = '';
        $tieneImagen = false;

        foreach ($run->childNodes as $hijo) {
            if (!$hijo instanceof DOMElement) {
                continue;
            }

            switch ($hijo->localName) {
                case 't':
                    $texto .= $hijo->textContent;
                    break;
                case 'tab':
                    $texto .= '    ';
                    break;
                case 'br':
                    $texto .= "\n";
                    break;
                case 'drawing':
                case 'pict':
                    $tieneImagen = true;
                    break;
            }
        }

        if ($texto === '' && !$tieneImagen) {
            continue;
        }

        if ($tieneImagen) {
            $texto .= '[imagen]';
        }

        $texto = htmlspecialchars($texto, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $texto = nl2br($texto, false);

        if (runTienePropiedad($run, 'b', $xpath)) {
            $texto = '<strong>' . $texto . '</strong>';
        }

        if (runTienePropiedad($run, 'i', $xpath)) {
            $texto = '<em>' . $texto . '</em>';
        }

        if (runTienePropiedad($run, 'u', $xpath)) {
            $texto = '<u>' . $texto . '</u>';
        }

        $html .= $texto;
    }

    return $html;
}

/**
 * Comprueba si un run tiene una propiedad activa (b, i, u).
 */
function runTienePropiedad(DOMElement $run, string $propiedad, DOMXPath $xpath): bool
{
    $nodo = $xpath->query('./w:rPr/w:' . $propiedad, $run)->item(0);

    if (!$nodo instanceof DOMElement) {
        return false;
    }

    $valor = $nodo->getAttributeNS(DOCX_NS, 'val');

    if ($propiedad === 'u') {
        return $valor !== 'none';
    }

    return $valor === '' || $valor === '1' || $valor === 'true' || $valor === 'on';
}

/**
 * Convierte una tabla Word a una tabla Bootstrap.
 */
function tablaDocxAHtml(DOMElement $tabla, DOMXPath $xpath): string
{
    $html = '<div class="table-responsive mb-3"><table class="table table-sm table-bordered align-middle mb-0"><tbody>';

    foreach ($xpath->query('./w:tr', $tabla) as $fila) {
        if (!$fila instanceof DOMElement) {
            continue;
        }

        $html .= '<tr>';

        foreach ($xpath->query('./w:tc', $fila) as $celda) {
            if (!$celda instanceof DOMElement) {
                continue;
            }

            $contenido = '';

            foreach ($xpath->query('./w:p', $celda) as $parrafo) {
                if ($parrafo instanceof DOMElement) {
                    $contenido .= parrafoDocxAHtml($parrafo, $xpath);
                }
            }

            $spanNodo = $xpath->query('./w:tcPr/w:gridSpan/@w:val', $celda)->item(0);
            $colspan = $spanNodo instanceof DOMAttr ? max(1, (int) $spanNodo->nodeValue) : 1;
            $atributoColspan = $colspan > 1 ? ' colspan="' . $colspan . '"' : '';

            $html .= '<td' . $atributoColspan . '>' . ($contenido !== '' ? $contenido : '&nbsp;') . '</td>';
        }

        $html .= '</tr>';
    }

    return $html . '</tbody></table></div>';
}
