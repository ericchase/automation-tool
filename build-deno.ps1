if ((Get-Command "deno.exe" -ErrorAction SilentlyContinue) -eq $null) 
{ 
  irm https://deno.land/install.ps1 | iex
}

deno compile --allow-read --output doto.exe main.mjs