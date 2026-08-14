#!/bin/bash
# docs/examples/curl.sh - Exemplos de uso da API do TV Signage
set -e

API="http://localhost:5001"

echo "=== 1. Login (abrir no navegador - fluxo OAuth2 com o IdP) ==="
echo "$API/auth/login"

echo -e "\n=== 2. Usuario autenticado (precisa do cookie de sessao - copie do navegador apos logar) ==="
curl -s -b cookies.txt "$API/api/me" | jq .

echo -e "\n=== 3. Setores visiveis ao usuario ==="
curl -s -b cookies.txt "$API/api/setores" | jq .

echo -e "\n=== 4. Dashboard (setores + TVs online/offline) ==="
curl -s -b cookies.txt "$API/api/dashboard" | jq .

echo -e "\n=== 5. Playlist de um setor ==="
curl -s -b cookies.txt "$API/api/playlist/Recepcao" | jq .

echo -e "\n=== 6. Upload de midia (video MP4 ou imagem) ==="
curl -s -b cookies.txt -X POST "$API/api/media/upload/Recepcao" \
  -F "media=@video1.mp4" \
  -F "media=@banner.jpg" | jq .

echo -e "\n=== 7. Reordenar playlist ==="
curl -s -b cookies.txt -X POST "$API/api/playlist/reorder" \
  -H "Content-Type: application/json" \
  -d '{"orderedIds": [3, 1, 2]}' | jq .

echo -e "\n=== 8. [admin/ti] Setores + TVs cadastradas ==="
curl -s -b cookies.txt "$API/api/admin/setores" | jq .

echo -e "\n=== 9. [admin/ti] Cadastrar uma TV ==="
curl -s -b cookies.txt -X POST "$API/api/admin/tvs" \
  -H "Content-Type: application/json" \
  -d '{"nome": "TV Recepcao", "identificador": "recepcao-01", "setorId": 1}' | jq .

echo -e "\n=== 10. Pagina do player (consumida pela TV fisica, nao por sessao humana) ==="
echo "$API/tv/recepcao-01?token=SEU_ACCESS_TOKEN"

echo -e "\nConcluido."
