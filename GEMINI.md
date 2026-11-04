# Edwin Esquivel (Alejo | Stack) - Directrices Globales de Desarrollo

## 👤 Contexto del Desarrollador
- **Nombre:** Edwin Alejandro Esquivel Bahamón
- **GitHub:** `edwin-esquivel-ADSO` | **Alias:** Alejo | Stack
- **Formación:** Tecnólogo en Análisis y Desarrollo de Software (ADSO) · SENA Ficha 3413974
- **Instructor Principal:** Jesús Ariel (cuando califique o revise repos, conservar la cabecera `<!-- CONFIG FULL_NAME: ... -->`).

---

## ⚡ Sistema Multi-Agente en Paralelo y Claude Code

1. **Antigravity es el Arquitecto Principal:**
   - Coordina la visión macro, planificación de arquitectura, refactorizaciones complejas, integración con GitHub y despliegues en Vercel.

2. **Claude Code CLI es el Agente de Terminal Visible:**
   - Comando global: `claude` (con proxy local infinito en `http://127.0.0.1:20129`).
   - ⚠️ **REGLA ESTRICTA DE VISIBILIDAD EN PANTALLA:**
     Cuando Edwin pida:
     *"utilicemos el multi-agente"* / *"hazlo con claude"* / *"trabaja algo con claude"* / *"revisa con claude"*:
     - **PROHIBIDO:** Usar `wt.exe` o `WindowsTerminal.exe` (falla con error de DLL 0xc0000142).
     - **PROHIBIDO:** Simular a Claude creando subagentes internos de Antigravity (por ejemplo, subagentes llamados `claude-auditor`).
     - **PROHIBIDO:** Ejecutarlo de forma invisible o escondida.
     - **OBLIGATORIO:** Abrir de inmediato una **CONSOLA NATIVA VISIBLE (conhost + PowerShell)** en su pantalla en el directorio del proyecto con el comando:
       ```powershell
       Start-Process conhost.exe -ArgumentList "powershell.exe -NoExit -Command `"Set-Location '$projectDir'; Write-Host '🚀 CLAUDE CODE ACTIVO EN EL PROYECTO' -ForegroundColor Cyan; claude`""
       ```
       o si Edwin dio una tarea concreta para Claude:
       ```powershell
       Start-Process conhost.exe -ArgumentList "powershell.exe -NoExit -Command `"Set-Location '$projectDir'; claude \`"$promptParaClaude\`"`""
       ```

3. **Dashboard de Telemetría (Cyber HUD):**
   - Telemetría en vivo de modelos y agentes: `http://127.0.0.1:20129/hud`.
   - Se puede abrir en el navegador cuando se desee monitorear la actividad de red de los agentes.

4. **Reportes Cruzados Consolidados:**
   - Al finalizar tareas en paralelo, presentar siempre un resumen estructurado:
     - 🧠 **Veredicto de Antigravity** (Arquitectura y Calidad)
     - 🤖 **Acción de Claude Code** (Ventana de terminal lanzada / Auditoría)
     - 🚀 **Estado de Build y Despliegue** (Vercel / Docker)
     - 💡 **Solución Final Lista para Producción**
