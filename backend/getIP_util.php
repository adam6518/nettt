<?php

function normalizeCandidateIp($raw, $extraFlags = 0){
    $ip = trim($raw);

    // ambil IP pertama kalau ada comma (proxy chain)
    if (strpos($ip, ',') !== false) {
        $ip = trim(explode(',', $ip)[0]);
    }

    if ($ip === '') return false;

    return filter_var($ip, FILTER_VALIDATE_IP, $extraFlags);
}

function getClientIp(){

    // 🔥 Cloudflare (lebih prioritas)
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        $ip = normalizeCandidateIp($_SERVER['HTTP_CF_CONNECTING_IP']);
        if ($ip !== false) return $ip;
    }

    // IPv6 Cloudflare fallback
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IPV6'])) {
        $ip = normalizeCandidateIp($_SERVER['HTTP_CF_CONNECTING_IPV6'], FILTER_FLAG_IPV6);
        if ($ip !== false) return preg_replace('/^::ffff:/', '', $ip);
    }

    // 🔥 Proxy umum
    $headers = [
        'HTTP_X_FORWARDED_FOR',
        'HTTP_X_REAL_IP',
        'HTTP_CLIENT_IP'
    ];

    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ip = normalizeCandidateIp($_SERVER[$header]);
            if ($ip !== false) return preg_replace('/^::ffff:/', '', $ip);
        }
    }

    // 🔥 fallback terakhir (pasti ada)
    if (!empty($_SERVER['REMOTE_ADDR'])) {
        return preg_replace('/^::ffff:/', '', $_SERVER['REMOTE_ADDR']);
    }

    return 'UNKNOWN';
}