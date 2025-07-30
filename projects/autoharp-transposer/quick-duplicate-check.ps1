# Quick Duplicate Method Detection for Windows PowerShell
# Usage: .\quick-duplicate-check.ps1

Write-Host "🔍 Quick Duplicate Method Check" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Find all JavaScript files
$jsFiles = Get-ChildItem -Path . -Filter "*.js" -Recurse | Where-Object { $_.Name -notlike "node_modules*" }

Write-Host "`nScanning $($jsFiles.Count) JavaScript files...`n" -ForegroundColor Yellow

# Common method patterns to check
$patterns = @(
    "^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{",  # method() {
    "^\s*function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)",        # function name()
    "^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*function",    # name: function
    "^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=.*=>"            # name = () =>
)

$methodCounts = @{}
$methodLocations = @{}

foreach ($file in $jsFiles) {
    $content = Get-Content $file.FullName
    $lineNumber = 0
    
    foreach ($line in $content) {
        $lineNumber++
        
        foreach ($pattern in $patterns) {
            if ($line -match $pattern) {
                $methodName = $matches[1]
                
                # Skip common keywords and short names
                if ($methodName -in @("if", "for", "while", "switch", "try", "catch", "return", "var", "let", "const")) {
                    continue
                }
                
                if (-not $methodCounts.ContainsKey($methodName)) {
                    $methodCounts[$methodName] = 0
                    $methodLocations[$methodName] = @()
                }
                
                $methodCounts[$methodName]++
                $methodLocations[$methodName] += "$($file.Name):$lineNumber"
            }
        }
    }
}

# Report duplicates
$duplicates = $methodCounts.GetEnumerator() | Where-Object { $_.Value -gt 1 } | Sort-Object Value -Descending

if ($duplicates.Count -eq 0) {
    Write-Host "✅ No duplicate methods found!" -ForegroundColor Green
} else {
    Write-Host "❌ Found $($duplicates.Count) methods with duplicates:" -ForegroundColor Red
    
    foreach ($duplicate in $duplicates) {
        $methodName = $duplicate.Key
        $count = $duplicate.Value
        
        Write-Host "`n🚨 Method '$methodName' appears $count times:" -ForegroundColor Red
        foreach ($location in $methodLocations[$methodName]) {
            Write-Host "   📍 $location" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "   Total unique methods: $($methodCounts.Count)"
Write-Host "   Methods with duplicates: $($duplicates.Count)"
