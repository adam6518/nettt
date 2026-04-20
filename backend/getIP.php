<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // FIX CORS

function getRealIP() {
    if (isset($_SERVER['HTTP_CF_CONNECTING_IP'])) return $_SERVER['HTTP_CF_CONNECTING_IP'];
    if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) return explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

$ip = getRealIP();
$processedString = $ip;
$ispInfo = '';

// FIX HTTPS
if (isset($_GET['isp']) && $_GET['isp'] == 'true') {
    $url = "https://ip-api.com/json/{$ip}?fields=status,isp,country,city";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 3);

    $resp = curl_exec($ch);
    curl_close($ch);

    if ($resp) {
        $data = json_decode($resp, true);
        if ($data && $data['status'] == 'success') {
            $processedString = "{$ip} | {$data['isp']} | {$data['city']}, {$data['country']}";
            $ispInfo = $data;
        }
    }
}

echo json_encode([
    'processedString' => $processedString,
    'rawIspInfo' => $ispInfo
]);