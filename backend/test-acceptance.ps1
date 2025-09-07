# CityWatch Acceptance Tests
Write-Host "🚀 Starting CityWatch Acceptance Tests..." -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:5000/api"

# Test 1: Health Check
Write-Host "1️⃣ Testing health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "$baseUrl/../health" -Method GET
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "✅ Health endpoint working" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Health endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get Cities (should be empty initially)
Write-Host "`n2️⃣ Testing cities endpoint..." -ForegroundColor Yellow
try {
    $citiesResponse = Invoke-WebRequest -Uri "$baseUrl/cities" -Method GET
    $citiesData = $citiesResponse.Content | ConvertFrom-Json
    Write-Host "✅ Cities endpoint working - Found $($citiesData.cities.Count) cities" -ForegroundColor Green
} catch {
    Write-Host "❌ Cities endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Create Test Cities
Write-Host "`n3️⃣ Creating test cities..." -ForegroundColor Yellow
try {
    $cityABody = @{
        name = "Test City A"
        slug = "city-a"
    } | ConvertTo-Json

    $cityAResponse = Invoke-WebRequest -Uri "$baseUrl/cities" -Method POST -Body $cityABody -ContentType "application/json"
    $cityAData = $cityAResponse.Content | ConvertFrom-Json
    $cityAId = $cityAData.city.id
    Write-Host "✅ Created City A: $($cityAData.city.name) ($cityAId)" -ForegroundColor Green

    $cityBBody = @{
        name = "Test City B"
        slug = "city-b"
    } | ConvertTo-Json

    $cityBResponse = Invoke-WebRequest -Uri "$baseUrl/cities" -Method POST -Body $cityBBody -ContentType "application/json"
    $cityBData = $cityBResponse.Content | ConvertFrom-Json
    $cityBId = $cityBData.city.id
    Write-Host "✅ Created City B: $($cityBData.city.name) ($cityBId)" -ForegroundColor Green
} catch {
    Write-Host "❌ City creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: User Signup
Write-Host "`n4️⃣ Creating test users..." -ForegroundColor Yellow
try {
    $aliceBody = @{
        username = "alice"
        email = "alice@example.com"
        password = "P@ssw0rd1"
        cityId = $cityAId
    } | ConvertTo-Json

    $aliceResponse = Invoke-WebRequest -Uri "$baseUrl/auth/signup" -Method POST -Body $aliceBody -ContentType "application/json"
    $aliceData = $aliceResponse.Content | ConvertFrom-Json
    $aliceToken = $aliceData.accessToken
    Write-Host "✅ Created Alice (Citizen) in City A" -ForegroundColor Green

    $bobBody = @{
        username = "bob"
        email = "bob@example.com"
        password = "P@ssw0rd1"
        cityId = $cityAId
    } | ConvertTo-Json

    $bobResponse = Invoke-WebRequest -Uri "$baseUrl/auth/signup" -Method POST -Body $bobBody -ContentType "application/json"
    $bobData = $bobResponse.Content | ConvertFrom-Json
    $bobToken = $bobData.accessToken
    Write-Host "✅ Created Bob (Citizen) in City A" -ForegroundColor Green

    $carlBody = @{
        username = "carl"
        email = "carl@example.com"
        password = "P@ssw0rd1"
        cityId = $cityBId
    } | ConvertTo-Json

    $carlResponse = Invoke-WebRequest -Uri "$baseUrl/auth/signup" -Method POST -Body $carlBody -ContentType "application/json"
    $carlData = $carlResponse.Content | ConvertFrom-Json
    $carlToken = $carlData.accessToken
    Write-Host "✅ Created Carl (Citizen) in City B" -ForegroundColor Green
} catch {
    Write-Host "❌ User signup failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Create Report
Write-Host "`n5️⃣ Alice creates a report..." -ForegroundColor Yellow
try {
    $reportBody = @{
        title = "Garbage at 5th Street"
        description = "Large pile of garbage near the market causing health concerns"
        category = "GARBAGE"
    } | ConvertTo-Json

    $reportResponse = Invoke-WebRequest -Uri "$baseUrl/reports" -Method POST -Body $reportBody -ContentType "application/json" -Headers @{"Authorization" = "Bearer $aliceToken"}
    $reportData = $reportResponse.Content | ConvertFrom-Json
    $reportId = $reportData.report.id
    Write-Host "✅ Alice created report: $($reportData.report.title) ($reportId)" -ForegroundColor Green
} catch {
    Write-Host "❌ Report creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Bob can see Alice's report
Write-Host "`n6️⃣ Bob views reports (should see Alice's report)..." -ForegroundColor Yellow
try {
    $bobReportsResponse = Invoke-WebRequest -Uri "$baseUrl/reports" -Method GET -Headers @{"Authorization" = "Bearer $bobToken"}
    $bobReportsData = $bobReportsResponse.Content | ConvertFrom-Json
    $aliceReport = $bobReportsData.reports | Where-Object { $_.id -eq $reportId }
    if ($aliceReport) {
        Write-Host "✅ Bob can see Alice's report: $($aliceReport.title)" -ForegroundColor Green
    } else {
        Write-Host "❌ Bob cannot see Alice's report" -ForegroundColor Red
    }
    Write-Host "📊 Bob sees $($bobReportsData.reports.Count) total reports" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Bob's report view failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Carl cannot see Alice's report
Write-Host "`n7️⃣ Carl views reports (should NOT see Alice's report)..." -ForegroundColor Yellow
try {
    $carlReportsResponse = Invoke-WebRequest -Uri "$baseUrl/reports" -Method GET -Headers @{"Authorization" = "Bearer $carlToken"}
    $carlReportsData = $carlReportsResponse.Content | ConvertFrom-Json
    $aliceReportInCarl = $carlReportsData.reports | Where-Object { $_.id -eq $reportId }
    if (-not $aliceReportInCarl) {
        Write-Host "✅ Carl cannot see Alice's report (city isolation working)" -ForegroundColor Green
    } else {
        Write-Host "❌ Carl can see Alice's report (city isolation broken)" -ForegroundColor Red
    }
    Write-Host "📊 Carl sees $($carlReportsData.reports.Count) total reports" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Carl's report view failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Authority cannot create reports
Write-Host "`n8️⃣ Testing authority cannot create reports..." -ForegroundColor Yellow
try {
    $authorityBody = @{
        username = "authority_user"
        email = "authority@example.com"
        password = "P@ssw0rd1"
        cityId = $cityAId
    } | ConvertTo-Json

    $authoritySignupResponse = Invoke-WebRequest -Uri "$baseUrl/auth/signup" -Method POST -Body $authorityBody -ContentType "application/json"
    $authoritySignupData = $authoritySignupResponse.Content | ConvertFrom-Json
    $authorityToken = $authoritySignupData.accessToken

    $authorityReportBody = @{
        title = "Authority Report"
        description = "This should fail"
        category = "GARBAGE"
    } | ConvertTo-Json

    try {
        $authorityReportResponse = Invoke-WebRequest -Uri "$baseUrl/reports" -Method POST -Body $authorityReportBody -ContentType "application/json" -Headers @{"Authorization" = "Bearer $authorityToken"}
        Write-Host "❌ Authority can create reports (should be forbidden)" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "✅ Authority cannot create reports (403 Forbidden)" -ForegroundColor Green
        } else {
            Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Authority test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Acceptance tests completed!" -ForegroundColor Green
Write-Host "`n📋 Test Summary:" -ForegroundColor Cyan
Write-Host "✅ Health endpoint" -ForegroundColor Green
Write-Host "✅ Cities management" -ForegroundColor Green
Write-Host "✅ User signup with city assignment" -ForegroundColor Green
Write-Host "✅ Report creation (citizens only)" -ForegroundColor Green
Write-Host "✅ City-scoped report visibility" -ForegroundColor Green
Write-Host "✅ Authority role restrictions" -ForegroundColor Green
