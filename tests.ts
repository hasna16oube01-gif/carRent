$registerBody = @{
    nom_utilisateur = "TestClient"
    email = "client@test.com"
    mdp = "1234"
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Uri "http://localhost:3000/users/register" `
    -Method POST `
    -Body $registerBody `
    -ContentType "application/json"

Write-Host $response.message
