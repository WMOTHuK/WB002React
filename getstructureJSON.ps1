# Main function to get folder structure
function Get-FolderStructure {
    param (
        [string]$Path = '.',
        [int]$Depth = 100 # Maximum recursion depth
    )

    # Nested function for recursive tree building
    function Build-Tree {
        param (
            [System.IO.DirectoryInfo]$Directory,
            [int]$CurrentDepth
        )

        if ($CurrentDepth -gt $Depth) {
            return @{}
        }

        $tree = @{}

        # Get the list of ignored files and folders
        $ignoredItems = GetIgnorePatterns -Directory $Directory

        # Add files (if they are not ignored)
        foreach ($file in $Directory.GetFiles()) {
            if (-not (Should-Ignore -Item $file -IgnoredPatterns $ignoredItems)) {
                $tree[$file.Name] = $null
            }
        }

        # Add subfolders (if they are not ignored)
        foreach ($subDir in $Directory.GetDirectories()) {
            if (-not (Should-Ignore -Item $subDir -IgnoredPatterns $ignoredItems)) {
                $tree[$subDir.Name] = Build-Tree -Directory $subDir -CurrentDepth ($CurrentDepth + 1)
            }
        }

        return $tree
    }

    # Get the root folder
    $rootDir = Get-Item -Path $Path
    $structure = @{
        $rootDir.Name = Build-Tree -Directory $rootDir -CurrentDepth 1
    }

    return $structure
}

# Function to define ignore patterns explicitly
function GetIgnorePatterns {
    param (
        [System.IO.DirectoryInfo]$Directory
    )

    $patterns = @()

    # Folders to ignore
    $patterns += '^\.git$'       # .git folder
    $patterns += '^node_modules$' # node_modules folder
    $patterns += '^coverage$'     # coverage folder
    $patterns += '^build$'        # build folder
    $patterns += '^\..*\.pnp$'    # .pnp folder

    # Files to ignore
    $patterns += '.*\.pnp\.js$'                     # Files ending with .pnp.js
    $patterns += '.*\.DS_Store$'                    # Files ending with .DS_Store
    $patterns += '.*\.env\.local$'                  # Files ending with .env.local
    $patterns += '.*\.env\.development\.local$'     # Files ending with .env.development.local
    $patterns += '.*\.env\.test\.local$'            # Files ending with .env.test.local
    $patterns += '.*\.env\.production\.local$'      # Files ending with .env.production.local

    Write-Host "Final ignored patterns: $($patterns -join ', ')"
    return $patterns
}

# Function to check if a file or folder should be ignored
function Should-Ignore {
    param (
        [System.IO.FileSystemInfo]$Item,
        [array]$IgnoredPatterns
    )

    foreach ($pattern in $IgnoredPatterns) {
        if ($Item.Name -match $pattern) {
            return $true
        }
    }

    return $false
}

# Path to the folder (default is current folder)
$folderPath = 'D:\VSCODE\React'

# Get folder structure
try {
    $folderStructure = Get-FolderStructure -Path $folderPath

    # Convert structure to JSON-like format
    $jsonLikeOutput = ($folderStructure | ConvertTo-Json -Depth 100)

    # Save result to structure.txt
    $outputFilePath = Join-Path -Path $folderPath -ChildPath 'structure.txt'
    $jsonLikeOutput | Out-File -FilePath $outputFilePath -Encoding UTF8

    Write-Host 'Saved'
} catch {
    Write-Host 'Error'
}