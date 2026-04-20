<?php
// get_speedtest_servers.php
// Daftar server LibreSpeed publik yang kompatibel
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$servers = [
    [
        "name" => "Singapore (LibreSpeed Official)",
        "server" => "https://librespeed.sg/",
        "dlURL" => "backend/garbage.php",
        "ulURL" => "backend/empty.php",
        "pingURL" => "backend/empty.php",
        "getIpURL" => "backend/getIP.php"
    ],
    [
        "name" => "Finland - LeluX",
        "server" => "https://speedtest.lelux.fi/",
        "dlURL" => "backend/garbage.php",
        "ulURL" => "backend/empty.php",
        "pingURL" => "backend/empty.php",
        "getIpURL" => "backend/getIP.php"
    ],
    [
        "name" => "Netherlands - Serverius",
        "server" => "https://speedtest.serverius.net/",
        "dlURL" => "backend/garbage.php",
        "ulURL" => "backend/empty.php",
        "pingURL" => "backend/empty.php",
        "getIpURL" => "backend/getIP.php"
    ],
    [
        "name" => "Germany - Advanced.name",
        "server" => "https://speedtest.advanced.name/",
        "dlURL" => "backend/garbage.php",
        "ulURL" => "backend/empty.php",
        "pingURL" => "backend/empty.php",
        "getIpURL" => "backend/getIP.php"
    ],
    [
        "name" => "Slovakia - 0x.sk",
        "server" => "https://speedtest.0x.sk/",
        "dlURL" => "backend/garbage.php",
        "ulURL" => "backend/empty.php",
        "pingURL" => "backend/empty.php",
        "getIpURL" => "backend/getIP.php"
    ],
    [
        "name" => "USA - New York (LibreSpeed)",
        "server" => "https://librespeed.nyc/",
        "dlURL" => "backend/garbage.php",
        "ulURL" => "backend/empty.php",
        "pingURL" => "backend/empty.php",
        "getIpURL" => "backend/getIP.php"
    ],
    [
        "name" => "UK - London (LibreSpeed)",
        "server" => "https://librespeed.lon/",
        "dlURL" => "backend/garbage.php",
        "ulURL" => "backend/empty.php",
        "pingURL" => "backend/empty.php",
        "getIpURL" => "backend/getIP.php"
    ]
];

echo json_encode($servers);
?>