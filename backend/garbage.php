<?php
// Disable output buffering
@ini_set('zlib.output_compression', 'Off');
@ini_set('output_buffering', 'Off');
@ini_set('output_handler', '');

header('HTTP/1.1 200 OK');
if (isset($_GET['cors'])) {
    header('Access-Control-Allow-Origin: *');
}
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');
header('Content-Type: application/octet-stream');

$chunkSize = isset($_GET['ckSize']) ? intval($_GET['ckSize']) : 100;
if ($chunkSize < 1) $chunkSize = 100;

// Kirim data 1MB berkali-kali
$buffer = str_repeat('X', 1024 * 1024);
while (true) {
    echo $buffer;
    flush();
    usleep(200);
}
?>