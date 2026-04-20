<?php
@ini_set('zlib.output_compression', 'Off');
@ini_set('output_buffering', 'Off');

if (isset($_GET['cors'])) {
    header('Access-Control-Allow-Origin: *');
}
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');

// Simulasi latency kecil (biar ping tidak 0ms)
usleep(rand(10000, 40000));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Upload test: buang semua data yang dikirim
    $fp = fopen('php://input', 'rb');
    while (!feof($fp)) {
        fread($fp, 8192);
    }
    fclose($fp);
    exit;
}

// Ping test: response minimal
header('Content-Type: text/plain');
echo 'ok';
flush();
?>