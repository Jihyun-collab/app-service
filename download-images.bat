@echo off
cd /d %~dp0
if not exist assets\img mkdir assets\img
curl -fsSL -o "assets\img\hero_mascot.png" "https://www.figma.com/api/mcp/asset/e0f004bd-a755-46ae-86e6-f3ad79d672a3"
curl -fsSL -o "assets\img\photo.png" "https://www.figma.com/api/mcp/asset/31d4a4f4-bf0e-4ffa-a7a4-4bda59827899"
curl -fsSL -o "assets\img\photo_a.png" "https://www.figma.com/api/mcp/asset/223503e0-9a57-4e1c-808c-dd7c19e1360e"
curl -fsSL -o "assets\img\photo_b.png" "https://www.figma.com/api/mcp/asset/ead9a19f-7760-4058-ac72-2781a08cb11c"
curl -fsSL -o "assets\img\sprite1.png" "https://www.figma.com/api/mcp/asset/55e0446d-de3e-462e-8531-1fe076515df2"
curl -fsSL -o "assets\img\sprite2.png" "https://www.figma.com/api/mcp/asset/fa54ac1b-c238-4e78-b812-3b0daa248d4f"
curl -fsSL -o "assets\img\sprite3.png" "https://www.figma.com/api/mcp/asset/42a6e7dc-5bdf-4f8d-a729-4dc4693ccc95"
curl -fsSL -o "assets\img\hetty.png" "https://www.figma.com/api/mcp/asset/5f5e34b9-8c8b-4209-89ec-3ffb1d4d4b68"
curl -fsSL -o "assets\img\hetty_hit.png" "https://www.figma.com/api/mcp/asset/8b3f2a92-c6d8-4e31-8555-2f94421b88a9"
curl -fsSL -o "assets\img\hetty_ad.png" "https://www.figma.com/api/mcp/asset/c98ba009-14ce-4528-83cc-46f92ffff1ae"
curl -fsSL -o "assets\img\sb_signal.svg" "https://www.figma.com/api/mcp/asset/6ff9f431-029e-41d0-9a97-29835c208d48.svg"
curl -fsSL -o "assets\img\sb_wifi.svg" "https://www.figma.com/api/mcp/asset/33d01caf-5350-43bb-9b9a-a939e5516e45.svg"
curl -fsSL -o "assets\img\sb_battery.svg" "https://www.figma.com/api/mcp/asset/b6c4540b-6af8-4047-8b20-dbec760b879d.svg"
curl -fsSL -o "assets\img\sb_time.svg" "https://www.figma.com/api/mcp/asset/0d11c2f0-efb6-4f6e-abb4-c1421248ec36.svg"
echo done & pause
