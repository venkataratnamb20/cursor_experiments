# Verification Engineer B — Chrome CDP driver (Windows host)
$ErrorActionPreference = 'Stop'
$Base = 'http://127.0.0.1:4173'
$OutDir = 'D:\workspaces\experiments\cursor_exp\cursor_experiments\portfolio\singlepage_htmlcssjs\docs\tests\manual\screenshots-b'
$JsonOut = 'D:\workspaces\experiments\cursor_exp\cursor_experiments\portfolio\singlepage_htmlcssjs\docs\tests\manual\_verify-b-results.json'
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

Add-Type -AssemblyName System.Net.Http
Add-Type -AssemblyName System.Runtime.WindowsRuntime

function Await-Task($task) {
  # Return only the task result; suppress void/non-generic Task output pollution.
  $result = $task.GetAwaiter().GetResult()
  return ,$result
}

function CdpConnect([string]$wsUrl) {
  $socket = [System.Net.WebSockets.ClientWebSocket]::new()
  $uri = [Uri]$wsUrl
  [void](Await-Task ($socket.ConnectAsync($uri, [Threading.CancellationToken]::None)))
  return $socket
}

function CdpSend($socket, $id, $method, $params) {
  $obj = @{ id = $id; method = $method }
  if ($null -ne $params) { $obj.params = $params }
  $json = ($obj | ConvertTo-Json -Depth 20 -Compress)
  $bytes = [Text.Encoding]::UTF8.GetBytes($json)
  $segment = [ArraySegment[byte]]::new($bytes)
  [void](Await-Task ($socket.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None)))
}

function CdpRecv($socket, [int]$expectId, [int]$timeoutMs = 30000) {
  $deadline = [DateTime]::UtcNow.AddMilliseconds($timeoutMs)
  $buffer = New-Object byte[] 1048576
  while ([DateTime]::UtcNow -lt $deadline) {
    $ms = New-Object System.IO.MemoryStream
    $end = $false
    while (-not $end) {
      $segment = [ArraySegment[byte]]::new($buffer)
      $result = Await-Task ($socket.ReceiveAsync($segment, [Threading.CancellationToken]::None))
      # Await-Task returns Object[]; unwrap first element when needed
      if ($result -is [Array]) { $result = $result[0] }
      $ms.Write($buffer, 0, $result.Count)
      $end = $result.EndOfMessage
      if ($result.MessageType -eq [System.Net.WebSockets.WebSocketMessageType]::Close) {
        throw 'WebSocket closed'
      }
    }
    $text = [Text.Encoding]::UTF8.GetString($ms.ToArray())
    $msg = $text | ConvertFrom-Json
    if ($null -ne $msg.id -and [int]$msg.id -eq $expectId) { return $msg }
    # keep draining events
  }
  throw "Timeout waiting for CDP id=$expectId"
}

function CdpCall($socket, [ref]$nextId, $method, $params) {
  $id = $nextId.Value
  $nextId.Value = $id + 1
  CdpSend $socket $id $method $params
  return (CdpRecv $socket $id)
}

function HttpGet([string]$url) {
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 20
    return @{ ok = $true; status = [int]$r.StatusCode; contentType = $r.Headers['Content-Type']; body = $r.Content; len = $r.RawContentLength }
  } catch {
    $status = 0
    if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
    return @{ ok = $false; status = $status; error = $_.Exception.Message; body = $null }
  }
}

function SaveScreenshot($ws, [ref]$nextId, [string]$path, [bool]$fullPage = $false) {
  if ($fullPage) {
    $metrics = CdpCall $ws $nextId 'Page.getLayoutMetrics' $null
    $content = $metrics.result.contentSize
    if (-not $content) { $content = $metrics.result.cssContentSize }
    $width = [math]::Ceiling([double]$content.width)
    $height = [math]::Min([math]::Ceiling([double]$content.height), 16000)
    CdpCall $ws $nextId 'Emulation.setDeviceMetricsOverride' @{
      width = [int]$width
      height = [int]$height
      deviceScaleFactor = 1
      mobile = $false
    } | Out-Null
  }
  $shot = CdpCall $ws $nextId 'Page.captureScreenshot' @{ format = 'png'; fromSurface = $true; captureBeyondViewport = $fullPage }
  $bytes = [Convert]::FromBase64String($shot.result.data)
  [IO.File]::WriteAllBytes($path, $bytes)
  if ($fullPage) {
    # reset later by caller viewport
  }
}

$checks = New-Object System.Collections.Generic.List[object]
$defects = New-Object System.Collections.Generic.List[object]
function Pass($id, $detail) { $checks.Add([pscustomobject]@{ id = $id; status = 'PASS'; detail = "$detail" }) | Out-Null }
function Fail($id, $detail, $severity = 'major') {
  $checks.Add([pscustomobject]@{ id = $id; status = 'FAIL'; detail = "$detail"; severity = $severity }) | Out-Null
  $defects.Add([pscustomobject]@{ id = $id; detail = "$detail"; severity = $severity }) | Out-Null
}

# Ensure Chrome CDP is up
$version = HttpGet 'http://127.0.0.1:9222/json/version'
if (-not $version.ok) { throw "CDP not available: $($version.error)" }

# Open a fresh tab
$newTab = Invoke-RestMethod -Uri "http://127.0.0.1:9222/json/new?$([uri]::EscapeDataString($Base))" -Method Put
$wsUrl = $newTab.webSocketDebuggerUrl
$ws = CdpConnect $wsUrl
$nextId = 1
$nextIdRef = [ref]$nextId

CdpCall $ws $nextIdRef 'Page.enable' $null | Out-Null
CdpCall $ws $nextIdRef 'Runtime.enable' $null | Out-Null
CdpCall $ws $nextIdRef 'Network.enable' $null | Out-Null

# Clear storage / unregister SW via CDP
CdpCall $ws $nextIdRef 'Emulation.setEmulatedMedia' @{ features = @(@{ name = 'prefers-reduced-motion'; value = 'no-preference' }) } | Out-Null
CdpCall $ws $nextIdRef 'Emulation.setDeviceMetricsOverride' @{ width = 1280; height = 800; deviceScaleFactor = 1; mobile = $false } | Out-Null

$nav = CdpCall $ws $nextIdRef 'Page.navigate' @{ url = $Base }
Start-Sleep -Seconds 2

# Unregister SW + clear caches
$clearExpr = @'
(async () => {
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map(r => r.unregister()));
  }
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  }
  try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}
  return true;
})()
'@
[void](CdpCall $ws $nextIdRef 'Runtime.evaluate' @{ expression = $clearExpr; awaitPromise = $true; returnByValue = $true })
CdpCall $ws $nextIdRef 'Page.reload' @{ ignoreCache = $true } | Out-Null
Start-Sleep -Seconds 3

function EvalJs($expression) {
  $res = CdpCall $ws $nextIdRef 'Runtime.evaluate' @{
    expression = $expression
    awaitPromise = $true
    returnByValue = $true
  }
  if ($res.result.exceptionDetails) {
    throw "JS error: $($res.result.exceptionDetails | ConvertTo-Json -Compress)"
  }
  return $res.result.result.value
}

$probe = @'
(() => {
  const meta = (n) => document.querySelector(`meta[name="${n}"]`)?.content || null;
  const prop = (p) => document.querySelector(`meta[property="${p}"]`)?.content || null;
  const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => {
    try { return JSON.parse(s.textContent); } catch { return { parseError: true }; }
  });
  const sectionIds = ['home','about','education','experience','portfolio','resume','contact','faq'];
  const sections = sectionIds.map(id => {
    const el = document.getElementById(id);
    return { id, exists: !!el, tag: el?.tagName?.toLowerCase() || null, heading: el?.querySelector('h1,h2,h3')?.textContent?.trim() || null };
  });
  const nav = document.querySelector('nav, [role="navigation"]');
  const navLinks = [...(nav?.querySelectorAll('a') || [])].map(a => ({ text: a.textContent.trim(), href: a.getAttribute('href') }));
  const video = document.querySelector('video');
  const imgs = [...document.querySelectorAll('img')].map(img => ({
    src: img.currentSrc || img.src, alt: img.alt, complete: img.complete, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight
  }));
  const cssVars = {};
  for (const v of ['--bg','--background','--color-bg','--surface','--ink','--text','--accent','--bg-deep','--color-background']) {
    const val = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    if (val) cssVars[v] = val;
  }
  const bodyText = document.body.innerText;
  return {
    title: document.title,
    description: meta('description'),
    canonical: document.querySelector('link[rel="canonical"]')?.href || null,
    manifest: document.querySelector('link[rel="manifest"]')?.href || null,
    ogTitle: prop('og:title'),
    jsonLd,
    sections,
    navLinks,
    main: !!document.querySelector('main'),
    header: !!document.querySelector('header'),
    footer: !!document.querySelector('footer'),
    heroTitle: document.querySelector('#home h1, .hero h1, h1')?.textContent?.trim() || null,
    heroSub: document.querySelector('#home p, .hero p')?.textContent?.trim() || null,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    cssVars,
    hasPlaceholder: /Software engineer building reliable systems/i.test(bodyText),
    videoPresent: !!video,
    videoSrc: video?.currentSrc || video?.src || [...(video?.querySelectorAll('source') || [])].map(s => s.src)[0] || null,
    poster: video?.getAttribute('poster') || null,
    videoDisplay: video ? getComputedStyle(video).display : null,
    imgs,
    projectLinks: [...document.querySelectorAll('#portfolio a[href], a[href*="github.com"]')].map(a => ({ text: a.textContent.trim().slice(0,80), href: a.href })),
    resumeHref: document.querySelector('a[href*=".pdf"]')?.href || null,
    mailto: [...document.querySelectorAll('a[href^="mailto:"]')].map(a => a.href),
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  };
})()
'@

# Runtime.evaluate returnByValue may fail on complex objects in older CDP; serialize to JSON string
$raw = EvalJs "JSON.stringify(($probe))"
$data = $raw | ConvertFrom-Json

# SEO
if ($data.title -match 'Analog|IC|Venkata|Ratnam') { Pass 'seo-title' $data.title } else { Fail 'seo-title' "Unexpected title: $($data.title)" }
if ($data.description -and $data.description.Length -gt 20 -and $data.description -notmatch 'Software engineer building reliable systems') {
  Pass 'seo-description' $data.description.Substring(0, [Math]::Min(120, $data.description.Length))
} else { Fail 'seo-description' "Missing/placeholder: $($data.description)" }
if ($data.canonical) { Pass 'seo-canonical' $data.canonical } else { Fail 'seo-canonical' 'No canonical' }

$person = $data.jsonLd | Where-Object { $_.'@type' -eq 'Person' -or ($_.'@type' -is [array] -and $_.'@type' -contains 'Person') } | Select-Object -First 1
if ($person) {
  $job = [string]$person.jobTitle
  if ($job -match 'Analog\s*IC') { Pass 'seo-jsonld-jobTitle' $job } else { Fail 'seo-jsonld-jobTitle' "jobTitle=$job" }
  $email = [string]$person.email
  if ($email -match '@') { Pass 'seo-jsonld-email' $email } else { Fail 'seo-jsonld-email' "email=$email" }
} else { Fail 'seo-jsonld-person' 'No Person JSON-LD' }

# PWA
if ($data.manifest) { Pass 'pwa-manifest-link' $data.manifest } else { Fail 'pwa-manifest-link' 'No manifest link' }
$manifestUrl = if ($data.manifest -match '^http') { $data.manifest } else { "$Base/manifest.webmanifest" }
$man = HttpGet $manifestUrl
if ($man.ok) { Pass 'pwa-manifest-fetch' "HTTP $($man.status)" } else { Fail 'pwa-manifest-fetch' "$($man.status) $($man.error)" }

Start-Sleep -Seconds 1
$swRaw = EvalJs '(async()=>{ if(!("serviceWorker" in navigator)) return JSON.stringify({supported:false}); const reg=await navigator.serviceWorker.getRegistration(); return JSON.stringify({supported:true,registered:!!reg,scope:reg&&reg.scope||null,active:!!(reg&&reg.active),controller:!!navigator.serviceWorker.controller}); })()'
$sw = $swRaw | ConvertFrom-Json
if ($sw.registered) { Pass 'pwa-sw-register' ($sw | ConvertTo-Json -Compress) } else { Fail 'pwa-sw-register' ($sw | ConvertTo-Json -Compress) }

# Sections / nav
foreach ($s in $data.sections) {
  if ($s.exists) { Pass "section-$($s.id)" "$($s.tag) $($s.heading)" } else { Fail "section-$($s.id)" 'Missing' }
}
foreach ($id in @('home','about','education','experience','portfolio','resume','contact','faq')) {
  $hit = $data.navLinks | Where-Object { $_.href -match "#$id" -or $_.text -match $id }
  if ($hit) { Pass "nav-$id" ($hit | Select-Object -First 1 | ConvertTo-Json -Compress) } else { Fail "nav-$id" "No nav link for #$id" }
}
if ($data.main) { Pass 'landmark-main' 'present' } else { Fail 'landmark-main' 'missing' }
if ($data.header) { Pass 'landmark-header' 'present' } else { Fail 'landmark-header' 'missing' }

if ($data.heroTitle -match 'Analog\s*IC|Staff Analog') { Pass 'hero-title-analog' $data.heroTitle }
elseif ($data.hasPlaceholder) { Fail 'hero-title-analog' "Placeholder detected; hero=$($data.heroTitle)" 'critical' }
else { Fail 'hero-title-analog' "hero=$($data.heroTitle)" 'critical' }

if (-not $data.hasPlaceholder) { Pass 'copy-no-placeholder' 'OK' } else { Fail 'copy-no-placeholder' 'Placeholder copy visible' 'critical' }

$darkOk = ($data.cssVars.PSObject.Properties.Value -join ' ') -match '#090d16'
if (-not $darkOk -and $data.bodyBg -match 'rgb\(\s*(\d+),\s*(\d+),\s*(\d+)') {
  $r=[int]$Matches[1]; $g=[int]$Matches[2]; $b=[int]$Matches[3]
  if ($r -lt 40 -and $g -lt 40 -and $b -lt 55) { $darkOk = $true }
}
if ($darkOk) { Pass 'design-dark-bg' "bodyBg=$($data.bodyBg) vars=$($data.cssVars | ConvertTo-Json -Compress)" }
else { Fail 'design-dark-bg' "bodyBg=$($data.bodyBg) vars=$($data.cssVars | ConvertTo-Json -Compress)" }

if ($data.poster) { Pass 'media-hero-poster' $data.poster } else { Fail 'media-hero-poster' 'missing' }
if ($data.videoPresent -and $data.videoSrc) { Pass 'media-hero-video' $data.videoSrc } else { Fail 'media-hero-video' 'missing' }

foreach ($img in $data.imgs) {
  if (-not $img.src) { continue }
  $name = [IO.Path]::GetFileName(([Uri]$img.src).AbsolutePath)
  if ($img.naturalWidth -gt 0) { Pass "img-loaded-$name" "$($img.naturalWidth)x$($img.naturalHeight)" }
  else { Fail "img-loaded-$name" "failed $($img.src)" }
}

$assetUrls = @(
  "$Base/assets/hero-poster.jpg",
  "$Base/assets/hero-loop.mp4",
  "$Base/assets/ATTRIBUTION.md",
  "$Base/manifest.webmanifest",
  "$Base/sw.js"
)
foreach ($img in $data.imgs) {
  if ($img.src -match '/assets/' -and $assetUrls -notcontains $img.src) { $assetUrls += $img.src }
}
if ($data.resumeHref) { $assetUrls += $data.resumeHref }

$assetStatuses = @()
foreach ($u in $assetUrls) {
  $r = HttpGet $u
  $assetStatuses += [pscustomobject]@{ url = $u; status = $r.status; ok = $r.ok; contentType = $r.contentType }
  $name = $u.Replace($Base, '')
  if ($r.ok) { Pass "http-$name" "HTTP $($r.status) $($r.contentType)" } else { Fail "http-$name" "HTTP $($r.status) $($r.error)" }
}

$realGh = @($data.projectLinks | Where-Object { $_.href -match 'github\.com/(microsoft/autogen|crewAIInc/crewAI)' })
$anyGh = @($data.projectLinks | Where-Object { $_.href -match 'github\.com/' -and $_.href -notmatch 'example\.com|yourusername' })
if ($realGh.Count -ge 1) { Pass 'projects-github-real' (($realGh | ForEach-Object href) -join ', ') }
elseif ($anyGh.Count -ge 1) { Pass 'projects-github-real' (('Other real GH: ') + (($anyGh | ForEach-Object href) -join ', ')) }
else { Fail 'projects-github-real' ($data.projectLinks | ConvertTo-Json -Compress) }

if (-not $data.overflowX) { Pass 'responsive-1280-no-overflow' "sw=$($data.scrollWidth) cw=$($data.clientWidth)" }
else { Fail 'responsive-1280-no-overflow' "sw=$($data.scrollWidth) cw=$($data.clientWidth)" }

SaveScreenshot $ws $nextIdRef (Join-Path $OutDir 'desktop-1280-hero.png') $false
# full page
SaveScreenshot $ws $nextIdRef (Join-Path $OutDir 'desktop-1280-full.png') $true
CdpCall $ws $nextIdRef 'Emulation.setDeviceMetricsOverride' @{ width = 1280; height = 800; deviceScaleFactor = 1; mobile = $false } | Out-Null
Pass 'screenshot-desktop' 'desktop-1280-full.png + hero'

# Nav to experience
EvalJs 'document.querySelector("a[href=\"#experience\"]")?.click(); "ok"' | Out-Null
Start-Sleep -Milliseconds 700
$exp = EvalJs 'JSON.stringify((()=>{ const el=document.getElementById("experience"); const rect=el.getBoundingClientRect(); return { top:rect.top, inView: rect.top < innerHeight && rect.bottom > 0, hash: location.hash }; })())' | ConvertFrom-Json
if ($exp.inView -or $exp.hash -eq '#experience') { Pass 'nav-scroll-experience' ($exp | ConvertTo-Json -Compress) } else { Fail 'nav-scroll-experience' ($exp | ConvertTo-Json -Compress) }
SaveScreenshot $ws $nextIdRef (Join-Path $OutDir 'desktop-1280-experience.png') $false

# FAQ
EvalJs 'document.querySelector("a[href=\"#faq\"]")?.click(); "ok"' | Out-Null
Start-Sleep -Milliseconds 500
$faq = EvalJs @'
JSON.stringify((() => {
  const details = [...document.querySelectorAll("#faq details")];
  const buttons = [...document.querySelectorAll("#faq button, #faq [aria-expanded]")];
  if (details.length) {
    const d = details[0];
    const before = d.open;
    d.open = true;
    const afterOpen = d.open;
    d.open = false;
    return { mode: "details", before, afterOpen, afterClose: d.open, count: details.length };
  }
  if (buttons.length) {
    const btn = buttons[0];
    const before = btn.getAttribute("aria-expanded");
    btn.click();
    const afterOpen = btn.getAttribute("aria-expanded");
    btn.click();
    const afterClose = btn.getAttribute("aria-expanded");
    return { mode: "button", before, afterOpen, afterClose, count: buttons.length };
  }
  return { mode: null, count: 0 };
})())
'@ | ConvertFrom-Json
if (($faq.mode -eq 'details' -and $faq.afterOpen -eq $true -and $faq.afterClose -eq $false) -or ($faq.mode -eq 'button' -and "$($faq.afterOpen)" -eq 'true')) {
  Pass 'faq-accordion' ($faq | ConvertTo-Json -Compress)
} elseif ($faq.count -gt 0 -and ($faq.afterOpen -eq $true -or "$($faq.afterOpen)" -eq 'true')) {
  Pass 'faq-accordion' ($faq | ConvertTo-Json -Compress)
} else { Fail 'faq-accordion' ($faq | ConvertTo-Json -Compress) }
SaveScreenshot $ws $nextIdRef (Join-Path $OutDir 'desktop-1280-faq.png') $false

# Contact validation
EvalJs 'document.querySelector("a[href=\"#contact\"]")?.click(); "ok"' | Out-Null
Start-Sleep -Milliseconds 500
$contact = EvalJs @'
JSON.stringify((() => {
  const form = document.querySelector("#contact form, form#contact-form, form");
  if (!form) return { form: false };
  form.querySelectorAll("input, textarea").forEach(el => {
    if (el.type !== "submit" && el.type !== "button" && el.type !== "hidden") el.value = "";
  });
  form.addEventListener("submit", e => e.preventDefault(), { capture: true, once: true });
  const submit = form.querySelector('button[type="submit"], input[type="submit"]');
  submit?.click();
  const invalid = [...form.querySelectorAll(":invalid")].map(el => el.name || el.id || el.type);
  const errors = [...document.querySelectorAll("#contact .error, #contact .form-error, #contact [role=\"alert\"], .field-error, .error-message")]
    .map(el => el.textContent.trim()).filter(Boolean);
  const ariaInvalid = form.querySelectorAll('[aria-invalid="true"]').length;
  const mailto = [...document.querySelectorAll("#contact a[href^=\"mailto:\"]")].map(a => a.href);
  const text = document.querySelector("#contact")?.innerText || "";
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return {
    form: true,
    action: form.getAttribute("action"),
    invalid,
    errors,
    ariaInvalid,
    reportValidity: form.checkValidity ? !form.checkValidity() : null,
    mailto,
    visibleEmail: emailMatch && emailMatch[0] || null
  };
})())
'@ | ConvertFrom-Json

$validationShown = ($contact.errors.Count -gt 0) -or ($contact.invalid.Count -gt 0) -or ($contact.ariaInvalid -gt 0) -or $contact.reportValidity
if ($validationShown) { Pass 'contact-validation' ($contact | ConvertTo-Json -Compress) } else { Fail 'contact-validation' ($contact | ConvertTo-Json -Compress) }
$mailto = $null
if ($contact.mailto -and $contact.mailto.Count -gt 0) { $mailto = $contact.mailto[0] }
elseif ($contact.action -match '^mailto:') { $mailto = $contact.action }
elseif ($contact.visibleEmail) { $mailto = $contact.visibleEmail }
elseif ($data.mailto -and $data.mailto.Count -gt 0) { $mailto = $data.mailto[0] }
if ($mailto) { Pass 'contact-mailto' $mailto } else { Fail 'contact-mailto' 'No mailto/email target' }
SaveScreenshot $ws $nextIdRef (Join-Path $OutDir 'desktop-1280-contact-validation.png') $false

# Mobile 375
CdpCall $ws $nextIdRef 'Emulation.setDeviceMetricsOverride' @{
  width = 375; height = 812; deviceScaleFactor = 2; mobile = $true
} | Out-Null
CdpCall $ws $nextIdRef 'Page.navigate' @{ url = $Base } | Out-Null
Start-Sleep -Seconds 2
$mobile = EvalJs @'
JSON.stringify((() => {
  const toggle = document.querySelector(".nav-toggle, button[aria-controls], [data-nav-toggle], .menu-toggle, button.hamburger");
  const hero = document.querySelector("h1");
  const heroRect = hero?.getBoundingClientRect();
  return {
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    togglePresent: !!toggle,
    toggleSelector: toggle ? (toggle.className || toggle.tagName) : null,
    heroText: hero?.textContent?.trim() || null,
    heroFontSize: hero ? getComputedStyle(hero).fontSize : null,
    heroWidth: heroRect?.width || 0,
    visibleNavLinks: [...document.querySelectorAll("nav a")].filter(a => a.getBoundingClientRect().height > 0).map(a => a.textContent.trim())
  };
})())
'@ | ConvertFrom-Json
SaveScreenshot $ws $nextIdRef (Join-Path $OutDir 'mobile-375-hero.png') $false
SaveScreenshot $ws $nextIdRef (Join-Path $OutDir 'mobile-375-full.png') $true
CdpCall $ws $nextIdRef 'Emulation.setDeviceMetricsOverride' @{ width = 375; height = 812; deviceScaleFactor = 2; mobile = $true } | Out-Null

if (-not $mobile.overflowX) { Pass 'responsive-375-no-overflow' ($mobile | ConvertTo-Json -Compress) } else { Fail 'responsive-375-no-overflow' ($mobile | ConvertTo-Json -Compress) }
if ($mobile.heroText -and $mobile.heroWidth -gt 100) { Pass 'responsive-375-hero-readable' "$($mobile.heroText) fs=$($mobile.heroFontSize)" } else { Fail 'responsive-375-hero-readable' ($mobile | ConvertTo-Json -Compress) }

if ($mobile.togglePresent) {
  EvalJs 'document.querySelector(".nav-toggle, button[aria-controls], [data-nav-toggle], .menu-toggle, button.hamburger")?.click(); "ok"' | Out-Null
  Start-Sleep -Milliseconds 400
  $open = EvalJs 'JSON.stringify({ visibleLinks: [...document.querySelectorAll("nav a, .nav-links a")].filter(a => { const r=a.getBoundingClientRect(); return r.width>0 && r.height>0; }).map(a => a.textContent.trim()) })' | ConvertFrom-Json
  if ($open.visibleLinks.Count -ge 4) { Pass 'responsive-375-nav-usable' ($open.visibleLinks -join ', ') }
  else { Fail 'responsive-375-nav-usable' ($open | ConvertTo-Json -Compress) }
  SaveScreenshot $ws $nextIdRef (Join-Path $OutDir 'mobile-375-nav-open.png') $false
} else {
  if ($mobile.visibleNavLinks.Count -ge 3) { Pass 'responsive-375-nav-usable' ('Inline: ' + ($mobile.visibleNavLinks -join ', ')) }
  else { Fail 'responsive-375-nav-usable' ($mobile | ConvertTo-Json -Compress) }
}

# Reduced motion
CdpCall $ws $nextIdRef 'Emulation.setDeviceMetricsOverride' @{ width = 1280; height = 800; deviceScaleFactor = 1; mobile = $false } | Out-Null
CdpCall $ws $nextIdRef 'Emulation.setEmulatedMedia' @{ features = @(@{ name = 'prefers-reduced-motion'; value = 'reduce' }) } | Out-Null
CdpCall $ws $nextIdRef 'Page.reload' @{ ignoreCache = $true } | Out-Null
Start-Sleep -Seconds 2
$rm = EvalJs @'
JSON.stringify((() => {
  const video = document.querySelector("video");
  if (!video) return { video: false };
  const style = getComputedStyle(video);
  return {
    video: true,
    display: style.display,
    visibility: style.visibility,
    opacity: style.opacity,
    paused: video.paused,
    hiddenAttr: video.hasAttribute("hidden"),
    ariaHidden: video.getAttribute("aria-hidden"),
    className: video.className
  };
})())
'@ | ConvertFrom-Json
if (-not $rm.video -or $rm.display -eq 'none' -or $rm.visibility -eq 'hidden' -or $rm.opacity -eq '0' -or $rm.hiddenAttr -or $rm.ariaHidden -eq 'true' -or $rm.paused) {
  Pass 'motion-reduced-video' ($rm | ConvertTo-Json -Compress)
} else { Fail 'motion-reduced-video' ($rm | ConvertTo-Json -Compress) }
SaveScreenshot $ws $nextIdRef (Join-Path $OutDir 'desktop-1280-reduced-motion.png') $false

# Attribution filesystem
$attrPath = 'D:\workspaces\experiments\cursor_exp\cursor_experiments\portfolio\singlepage_htmlcssjs\assets\ATTRIBUTION.md'
if (Test-Path $attrPath) { Pass 'attribution-file' $attrPath } else { Fail 'attribution-file' 'ATTRIBUTION.md missing' }

# Stale risk
$html = HttpGet $Base
$stale = @{
  htmlHasPlaceholder = ($html.body -match 'Software engineer building reliable systems')
  htmlHasAnalog = ($html.body -match 'Analog\s*IC')
  note = 'Cache-first SW can serve stale shell if prior visit cached old index.html/js'
}

$passCount = @($checks | Where-Object status -eq 'PASS').Count
$failCount = @($checks | Where-Object status -eq 'FAIL').Count
$summary = [pscustomobject]@{
  passCount = $passCount
  failCount = $failCount
  total = $checks.Count
}

$report = [pscustomobject]@{
  timestamp = (Get-Date).ToString('o')
  baseUrl = $Base
  method = 'Windows Chrome CDP + PowerShell (Playwright Linux chromium missing libnspr4)'
  summary = $summary
  checks = $checks
  defects = $defects
  observations = [pscustomobject]@{
    seo = [pscustomobject]@{ title = $data.title; description = $data.description; canonical = $data.canonical; manifest = $data.manifest; person = $person }
    serviceWorker = $sw
    heroTitle = $data.heroTitle
    bodyBg = $data.bodyBg
    cssVars = $data.cssVars
    media = [pscustomobject]@{ poster = $data.poster; videoSrc = $data.videoSrc; videoPresent = $data.videoPresent }
    projectLinks = $data.projectLinks
    faq = $faq
    contact = $contact
    mobile = $mobile
    reducedMotion = $rm
    assetStatuses = $assetStatuses
    staleRisk = $stale
  }
}

$report | ConvertTo-Json -Depth 12 | Set-Content -Path $JsonOut -Encoding UTF8
Write-Output ("SUMMARY pass=$passCount fail=$failCount total=$($checks.Count)")
Write-Output ("DEFECTS=$($defects.Count)")
$defects | ForEach-Object { Write-Output ("- [$($_.severity)] $($_.id): $($_.detail)") }
Write-Output "JSON=$JsonOut"
Write-Output "SHOTS=$OutDir"

try { Await ($ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, 'done', [Threading.CancellationToken]::None)) } catch {}
