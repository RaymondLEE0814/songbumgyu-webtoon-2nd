Add-Type -AssemblyName System.Drawing

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
$svgDir = Resolve-Path (Join-Path $projectRoot "second_draft\08_webtoon_svg\ep03_final")
$jsonPath = Join-Path $svgDir "ep03_overlays.json"
$data = Get-Content -Raw -Encoding UTF8 -LiteralPath $jsonPath | ConvertFrom-Json
$webOut = Resolve-Path (Join-Path $projectRoot "second_web\assets\images\ep03")

$font = New-Object System.Drawing.Font("Malgun Gothic", 15, [System.Drawing.FontStyle]::Bold)
$small = New-Object System.Drawing.Font("Malgun Gothic", 12, [System.Drawing.FontStyle]::Bold)
$black = [System.Drawing.Brushes]::Black
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::Black, 3)
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center

function Add-RoundRect($g, $brush, $pen, $x, $y, $w, $h, $r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  $g.FillPath($brush, $path)
  $g.DrawPath($pen, $path)
  $path.Dispose()
}

foreach ($part in $data.parts) {
  $src = Join-Path $svgDir $part.image
  $img = [System.Drawing.Image]::FromFile($src)
  $bmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.DrawImage($img, 0, 0, $img.Width, $img.Height)

  foreach ($item in $part.overlays) {
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(238,255,255,255))
    Add-RoundRect $g $brush $pen ([int]$item.x) ([int]$item.y) ([int]$item.w) ([int]$item.h) 14
    $text = ($item.text -join "`n")
    $rect = New-Object System.Drawing.RectangleF -ArgumentList @([float]$item.x, [float]$item.y, [float]$item.w, [float]$item.h)
    $useFont = if ($item.label -or [int]$item.h -le 46) { $small } else { $font }
    $g.DrawString($text, $useFont, $black, $rect, $format)
    $brush.Dispose()
  }

  $out = Join-Path $PSScriptRoot "ep03_webtoon_final_$($part.id).png"
  $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  Copy-Item -LiteralPath $out -Destination (Join-Path $webOut "ep03_webtoon_final_$($part.id).png") -Force
  $g.Dispose()
  $bmp.Dispose()
  $img.Dispose()
  Write-Output $out
}
