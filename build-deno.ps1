if ((Get-Command "deno.exe" -ErrorAction SilentlyContinue) -eq $null) 
{ 
  irm https://deno.land/install.ps1 | iex
}

deno compile --allow-read --allow-run --output doto.exe ./src/main.mjs