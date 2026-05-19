Add-Type -AssemblyName System.Drawing

$width = 720
$panels = @(
  @{ id="01"; h=820; title="새벽 분석실"; kind="lab"; lines=@("노이즈 제거율 0으로.") },
  @{ id="02"; h=700; title="데이터셋"; kind="dataset"; lines=@("station_noise_set_0217") },
  @{ id="03"; h=860; title="부적 획 스캔"; kind="talisman"; lines=@("사람은 버리고,", "기계는 남긴다.") },
  @{ id="04"; h=260; title="02:17 홈"; kind="wave"; lines=@("틱") },
  @{ id="05"; h=1180; title="AI 출력"; kind="terminal"; lines=@("도착하지 않음") },
  @{ id="06"; h=680; title="로그 확인"; kind="logs"; lines=@("반복 조건은 같고.") },
  @{ id="07"; h=760; title="세 레이어"; kind="layers"; lines=@("관측자...", "교체...") },
  @{ id="08"; h=300; title="화이트 플래시"; kind="flash"; lines=@("같은 사람 아님") },
  @{ id="W1"; h=900; title=""; kind="white"; lines=@() },
  @{ id="09"; h=920; title="명칭 보류"; kind="memo"; lines=@("명칭은 아직 이르다.") },
  @{ id="10"; h=700; title="익명 첨부"; kind="phone"; lines=@("누가 이걸...") },
  @{ id="11"; h=840; title="매칭률"; kind="match"; lines=@("새 관측자 감지") },
  @{ id="12"; h=640; title="문장이 멈춘다"; kind="face"; lines=@("이건 영상 안에서", "나온 게 아니야.") },
  @{ id="13"; h=800; title="동기화"; kind="sync"; lines=@("현장에서 주운 겁니까?") },
  @{ id="14"; h=740; title="첫 통화"; kind="call"; lines=@("누구세요.", "무섭다는 말은 아직 이릅니다.") },
  @{ id="15"; h=920; title="분석실 지연"; kind="labDelay"; lines=@("먼저 반복 조건부터 확인하죠.") },
  @{ id="16"; h=560; title="훅"; kind="final"; lines=@("관측자 교체 완료") }
)

$height = ($panels | ForEach-Object { $_.h } | Measure-Object -Sum).Sum
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$font = New-Object System.Drawing.Font("Malgun Gothic", 21, [System.Drawing.FontStyle]::Bold)
$small = New-Object System.Drawing.Font("Malgun Gothic", 15, [System.Drawing.FontStyle]::Bold)
$big = New-Object System.Drawing.Font("Malgun Gothic", 42, [System.Drawing.FontStyle]::Bold)
$terminal = New-Object System.Drawing.Font("Consolas", 22, [System.Drawing.FontStyle]::Bold)
$black = [System.Drawing.Brushes]::Black
$white = [System.Drawing.Brushes]::White
$blueBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(56,189,248))
$redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(225,29,72))
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(247,248,251))
$linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::Black, 4)
$redPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(215,25,32), 10)
$bluePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(56,189,248), 4)
$center = New-Object System.Drawing.StringFormat
$center.Alignment = [System.Drawing.StringAlignment]::Center
$center.LineAlignment = [System.Drawing.StringAlignment]::Center
$left = New-Object System.Drawing.StringFormat
$left.Alignment = [System.Drawing.StringAlignment]::Near
$left.LineAlignment = [System.Drawing.StringAlignment]::Near

function Fill-RoundRect($g, $brush, $x, $y, $w, $h, $r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  $g.FillPath($brush, $path)
  $g.DrawPath($script:linePen, $path)
  $path.Dispose()
}

function Draw-Caption($g, $panel, $y) {
  if ([string]::IsNullOrWhiteSpace($panel.title)) { return }
  $rectBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(238,255,255,255))
  Fill-RoundRect $g $rectBrush 22 ($y + 22) 244 42 20
  $g.DrawString("$($panel.id) $($panel.title)", $script:small, $script:black, 42, ($y + 32))
  $rectBrush.Dispose()
}

function Draw-Speech($g, [string[]]$lines, $x, $y, $w) {
  $h = 32 + $lines.Count * 31
  Fill-RoundRect $g ([System.Drawing.Brushes]::White) $x $y $w $h 18
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $rect = New-Object System.Drawing.RectangleF -ArgumentList @([float]$x, [float]($y + 20 + $i * 30), [float]$w, [float]30)
    $g.DrawString($lines[$i], $script:font, $script:black, $rect, $script:center)
  }
}

function Draw-Dust($g, $y, $h, $count, [System.Drawing.Color]$color) {
  for ($i = 0; $i -lt $count; $i++) {
    $alpha = 70 + (($i % 5) * 24)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($alpha, $color.R, $color.G, $color.B))
    $x = 28 + (($i * 83) % 660)
    $py = $y + 26 + (($i * 137) % [Math]::Max(80, $h - 52))
    $s = 3 + (($i % 5) * 2)
    $g.FillRectangle($brush, $x, $py, $s, $s)
    $brush.Dispose()
  }
}

function Draw-Terminal($g, $x, $y, $w, $h, [string[]]$lines) {
  $dark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(11,16,32))
  Fill-RoundRect $g $dark $x $y $w $h 12
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $brush = if ($i -eq $lines.Count - 1) { $script:white } else { [System.Drawing.Brushes]::LightGray }
    $g.DrawString($lines[$i], $script:terminal, $brush, ($x + 24), ($y + 48 + $i * 36))
  }
  $dark.Dispose()
}

function Draw-Wave($g, $mid, $pen) {
  $pts = New-Object System.Collections.Generic.List[System.Drawing.PointF]
  for ($i = 0; $i -le 18; $i++) {
    $x = 80 + $i * 32
    $amp = if ($i -in 8,9,10) { 64 } else { 22 }
    $py = $mid + [Math]::Sin($i * 1.7) * $amp
    $pts.Add((New-Object System.Drawing.PointF -ArgumentList @([float]$x, [float]$py)))
  }
  $g.DrawLines($pen, $pts.ToArray())
}

$g.Clear([System.Drawing.Color]::FromArgb(229,231,235))
$y = 0
foreach ($p in $panels) {
  $h = [int]$p.h
  $mid = $y + ($h / 2)
  $g.FillRectangle($bgBrush, 0, $y, $width, $h)
  $g.DrawRectangle($linePen, 0, $y, $width, $h)

  switch ($p.kind) {
    "lab" {
      $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(238,243,248))), 0, $y, $width, $h)
      $g.FillRectangle([System.Drawing.Brushes]::Black, 96, $mid - 210, 160, 210)
      $g.FillRectangle([System.Drawing.Brushes]::Black, 280, $mid - 250, 180, 250)
      $g.FillRectangle([System.Drawing.Brushes]::Black, 484, $mid - 195, 142, 195)
      $g.FillRectangle([System.Drawing.Brushes]::AliceBlue, 112, $mid - 188, 128, 162)
      Draw-Wave $g ($mid - 120) $bluePen
      $g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(215,176,140))), 319, $mid - 44, 68, 68)
      $g.FillRectangle([System.Drawing.Brushes]::DarkSlateGray, 318, $mid + 35, 70, 150)
    }
    "labDelay" {
      $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(238,243,248))), 0, $y, $width, $h)
      $g.FillRectangle([System.Drawing.Brushes]::Black, 96, $mid - 210, 160, 210)
      $g.FillRectangle([System.Drawing.Brushes]::Black, 280, $mid - 250, 180, 250)
      $g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(215,176,140))), 319, $mid - 44, 68, 68)
      $ghost = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(55,56,189,248))
      $g.FillRectangle($ghost, 420, $mid - 20, 90, 180)
      $ghost.Dispose()
    }
    "dataset" { Draw-Terminal $g 86 ($mid - 230) 548 370 @("> station_noise_set_0217", "[x] 폐역_CCTV_1999", "[x] 지하철_안내방송", "[x] 부적_획_스캔", "keep raw noise: TRUE") }
    "talisman" {
      $paper = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,248,223))
      $g.FillRectangle($paper, 210, $mid - 250, 300, 430)
      $g.DrawRectangle($linePen, 210, $mid - 250, 300, 430)
      $curve = @(
        (New-Object System.Drawing.PointF -ArgumentList @([float]360, [float]($mid - 202))),
        (New-Object System.Drawing.PointF -ArgumentList @([float]296, [float]($mid - 126))),
        (New-Object System.Drawing.PointF -ArgumentList @([float]426, [float]($mid - 78))),
        (New-Object System.Drawing.PointF -ArgumentList @([float]336, [float]($mid - 4))),
        (New-Object System.Drawing.PointF -ArgumentList @([float]430, [float]($mid + 36))),
        (New-Object System.Drawing.PointF -ArgumentList @([float]382, [float]($mid + 146)))
      )
      $g.DrawCurve($redPen, $curve)
      $paper.Dispose()
      Draw-Dust $g $y $h 34 ([System.Drawing.Color]::FromArgb(56,189,248))
    }
    "wave" { $g.FillRectangle([System.Drawing.Brushes]::White, 0, $y, $width, $h); Draw-Wave $g $mid $linePen; $rect = New-Object System.Drawing.RectangleF -ArgumentList @([float]0, [float]($mid + 22), [float]$width, [float]70); $g.DrawString("02:17", $big, $redBrush, $rect, $center) }
    "terminal" { Draw-Dust $g $y $h 90 ([System.Drawing.Color]::FromArgb(191,219,254)); Draw-Terminal $g 72 ($mid - 210) 576 310 @("> decode raw_noise", "confidence: unstable", "도착하지 않음") }
    "logs" { Draw-Terminal $g 96 ($mid - 190) 528 280 @("02:16:58  signal open", "02:16:59  frame delay", "02:17:00  repeat condition") }
    "layers" {
      $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230,15,23,42))), 76, $mid - 240, 260, 280)
      $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220,255,248,223))), 224, $mid - 150, 260, 280)
      $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(210,224,242,254))), 374, $mid - 58, 260, 280)
      Draw-Wave $g ($mid + 78) $bluePen
    }
    "flash" { $g.FillRectangle([System.Drawing.Brushes]::White, 0, $y, $width, $h); $rect = New-Object System.Drawing.RectangleF -ArgumentList @([float]0, [float]($mid - 35), [float]$width, [float]90); $g.DrawString("같은 사람 아님", $big, $black, $rect, $center) }
    "white" { $g.FillRectangle([System.Drawing.Brushes]::White, 0, $y, $width, $h); Draw-Dust $g $y $h 90 ([System.Drawing.Color]::FromArgb(56,189,248)); Draw-Dust $g $y $h 38 ([System.Drawing.Color]::FromArgb(215,25,32)) }
    "memo" {
      $g.FillRectangle([System.Drawing.Brushes]::White, 112, $mid - 270, 496, 410); $g.DrawRectangle($linePen, 112, $mid - 270, 496, 410)
      $g.DrawString("귀신", $font, $black, 186, $mid - 198); $g.DrawLine($redPen, 176, $mid - 190, 290, $mid - 168)
      $g.DrawString("잔류 정보?", $font, $black, 186, $mid - 108)
      $g.DrawString("관측 조건", $font, $black, 186, $mid - 38)
      $g.DrawString("사람이 아니라 사건?", $font, $black, 186, $mid + 34)
    }
    "phone" {
      Fill-RoundRect $g ([System.Drawing.Brushes]::Black) 240 ($mid - 250) 240 480 36
      $g.FillRectangle([System.Drawing.Brushes]::WhiteSmoke, 262, $mid - 204, 196, 388)
      $rect = New-Object System.Drawing.RectangleF -ArgumentList @([float]262, [float]($mid - 140), [float]196, [float]150)
      $g.DrawString("1999`n02:17", $big, $redBrush, $rect, $center)
    }
    "call" {
      Fill-RoundRect $g ([System.Drawing.Brushes]::Black) 240 ($mid - 250) 240 480 36
      $g.FillRectangle([System.Drawing.Brushes]::WhiteSmoke, 262, $mid - 204, 196, 388)
      $rect = New-Object System.Drawing.RectangleF -ArgumentList @([float]262, [float]($mid - 50), [float]196, [float]140)
      $g.DrawString("한서윤`n연결 중", $font, $black, $rect, $center)
    }
    "match" {
      Draw-Terminal $g 86 ($mid - 230) 548 320 @("ticket_fragment.png", "match: 17%", "match: 38%", "match: 99.9%", "새 관측자 감지")
      $g.FillRectangle([System.Drawing.Brushes]::LightGray, 132, $mid + 130, 456, 28)
      $g.FillRectangle($redBrush, 132, $mid + 130, 452, 28)
    }
    "face" {
      $skin = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(215,176,140))
      $g.FillEllipse($skin, 258, $mid - 156, 204, 204)
      $g.DrawEllipse($linePen, 258, $mid - 156, 204, 204)
      $g.FillRectangle($black, 318, $mid - 74, 22, 6); $g.FillRectangle($black, 382, $mid - 74, 22, 6)
      Draw-Terminal $g 94 ($y + $h - 188) 532 116 @("> cursor blinking _")
      $skin.Dispose()
    }
    "sync" {
      $g.FillRectangle([System.Drawing.Brushes]::Black, 58, $mid - 210, 278, 290)
      $rect = New-Object System.Drawing.RectangleF -ArgumentList @([float]58, [float]($mid - 92), [float]278, [float]50)
      $g.DrawString("CCTV 1999", $font, $white, $rect, $center)
      $g.FillRectangle([System.Drawing.Brushes]::LightYellow, 384, $mid - 210, 278, 290)
      $g.DrawRectangle($linePen, 384, $mid - 210, 278, 290)
      $rect = New-Object System.Drawing.RectangleF -ArgumentList @([float]384, [float]($mid - 92), [float]278, [float]50)
      $g.DrawString("승차권 조각", $font, $black, $rect, $center)
      $g.DrawLine($redPen, 336, $mid - 40, 384, $mid - 40)
    }
    "final" { $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(11,16,32))), 0, $y, $width, $h); Draw-Dust $g $y $h 70 ([System.Drawing.Color]::FromArgb(56,189,248)); $rect = New-Object System.Drawing.RectangleF -ArgumentList @([float]0, [float]($mid - 50), [float]$width, [float]100); $g.DrawString("관측자 교체 완료", $big, $white, $rect, $center) }
  }

  if ($p.lines.Count -gt 0 -and $p.kind -notin @("dataset","terminal","logs","flash","final")) {
    $speechWidth = if (($p.lines -join "").Length -gt 18) { 460 } else { 340 }
    Draw-Speech $g ([string[]]$p.lines) 68 ($y + $h - 138) $speechWidth
  }
  Draw-Caption $g $p $y
  $y += $h
}

$out = Join-Path $PSScriptRoot "ep02_webtoon_final.png"
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)

$webOut = Resolve-Path (Join-Path $PSScriptRoot "..\..\..\second_web\assets\images\ep02")
Copy-Item -LiteralPath $out -Destination (Join-Path $webOut "ep02_webtoon_final.png") -Force

$g.Dispose()
$bmp.Dispose()
Write-Output $out

