if ((Get-Command "deno.exe" -ErrorAction SilentlyContinue) -eq $null) 
{ 
  irm https://deno.land/install.ps1 | iex
}

deno compile --allow-read --allow-run --allow-write --output doto.exe ./src/main.mjs