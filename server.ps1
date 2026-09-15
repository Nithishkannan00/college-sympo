# Bulletproof Static HTTP Server in PowerShell with /api/register Proxy
Add-Type -AssemblyName System.Net.Http
$port = 3000
$root = "c:\Users\Asus\Desktop\college-sympo"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")

$listener.Start()
Write-Host "Server running at http://localhost:$port/ and http://127.0.0.1:$port/"

$mimes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png"  = "image/png"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".woff2"= "font/woff2"
    ".woff" = "font/woff"
    ".ttf"  = "font/ttf"
}

while ($true) {
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        $path = $req.Url.LocalPath
        if ($path -eq "/api/register") {
            $reqBody = ""
            $len = $req.ContentLength64
            if ($len -gt 0) {
                $buf = New-Object byte[] $len
                $readTotal = 0
                while ($readTotal -lt $len) {
                    $r = $req.InputStream.Read($buf, $readTotal, $len - $readTotal)
                    if ($r -le 0) { break }
                    $readTotal += $r
                }
                $reqBody = [System.Text.Encoding]::UTF8.GetString($buf, 0, $readTotal)
            }
            $gasUrl = "https://script.google.com/macros/s/AKfycbx1mmdlSF-gvkQ06--A0st5Hvl2gNV30FsaOaTWqXAhS35NDWh2tdIY2W0AhuliqZgy/exec"
            try {
                $handler = New-Object System.Net.Http.HttpClientHandler
                $handler.AllowAutoRedirect = $true
                $client = New-Object System.Net.Http.HttpClient($handler)
                $httpContent = New-Object System.Net.Http.StringContent($reqBody, [System.Text.Encoding]::UTF8, "application/json")
                $gasResp = $client.PostAsync($gasUrl, $httpContent).Result
                $respText = $gasResp.Content.ReadAsStringAsync().Result
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respText)
                $res.ContentType = "application/json; charset=utf-8"
                $res.StatusCode = 200
                $res.ContentLength64 = $respBytes.Length
                $res.OutputStream.Write($respBytes, 0, $respBytes.Length)
            } catch {
                $errJson = "{`"success`":false,`"error`":`"$($_.Exception.Message)`"}"
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes($errJson)
                $res.ContentType = "application/json; charset=utf-8"
                $res.StatusCode = 502
                $res.ContentLength64 = $errBytes.Length
                $res.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
            $res.Close()
            continue
        }

        if ($path -eq "/" -or [string]::IsNullOrWhiteSpace($path)) {
            $path = "/index.html"
        }

        $rel = $path.TrimStart('/').Replace('/', '\')
        $full = Join-Path $root $rel

        if (Test-Path $full -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($full).ToLower()
            $res.ContentType = if ($mimes.ContainsKey($ext)) { $mimes[$ext] } else { "application/octet-stream" }
            $bytes = [System.IO.File]::ReadAllBytes($full)
            $res.ContentLength64 = $bytes.Length
            $res.StatusCode = 200
            if ($req.HttpMethod -ne "HEAD") {
                $res.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        } else {
            $res.StatusCode = 404
            $err = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $res.ContentLength64 = $err.Length
            $res.ContentType = "text/plain; charset=utf-8"
            if ($req.HttpMethod -ne "HEAD") {
                $res.OutputStream.Write($err, 0, $err.Length)
            }
        }
        $res.Close()
    } catch {
        # Catch and continue on client abort
    }
}
