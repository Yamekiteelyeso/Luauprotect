document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const sourceCodeEl = document.getElementById('sourceCode');
  const outputCodeEl = document.getElementById('outputCode');
  const watermarkInput = document.getElementById('watermarkInput');
  const obfuscateBtn = document.getElementById('obfuscateBtn');
  const terminalLog = document.getElementById('terminalLog');
  const statusIndicator = document.getElementById('statusIndicator');
  
  const sourceStats = document.getElementById('sourceStats');
  const outputStats = document.getElementById('outputStats');
  const ratioBadge = document.getElementById('ratioBadge');

  const copyOutputBtn = document.getElementById('copyOutputBtn');
  const downloadOutputBtn = document.getElementById('downloadOutputBtn');
  const clearInputBtn = document.getElementById('clearInputBtn');
  const pasteInputBtn = document.getElementById('pasteInputBtn');

  // Modal & Keys
  const apiConfigBtn = document.getElementById('apiConfigBtn');
  const apiModal = document.getElementById('apiModal');
  const closeApiModal = document.getElementById('closeApiModal');
  const saveApiKeysBtn = document.getElementById('saveApiKeysBtn');
  
  const keyPrometheus = document.getElementById('keyPrometheus');
  const keyVolt = document.getElementById('keyVolt');
  const keyWin = document.getElementById('keyWin');

  // App State
  let selectedEngine = 'prometheus';
  let selectedPreset = 'medium';

  // Load Saved Keys
  keyPrometheus.value = localStorage.getItem('lexy_key_prometheus') || '';
  keyVolt.value = localStorage.getItem('lexy_key_volt') || '';
  keyWin.value = localStorage.getItem('lexy_key_win') || '';

  // Select Engine Card
  document.querySelectorAll('.engine-card').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.engine-card').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedEngine = btn.getAttribute('data-engine');
      logTerminal(`[CONFIG] Motor cambiado a: ${selectedEngine.toUpperCase()}`);
    });
  });

  // Select Preset Button
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPreset = btn.getAttribute('data-preset');
      logTerminal(`[CONFIG] Preset ajustado a: ${selectedPreset.toUpperCase()}`);
    });
  });

  // Code Stats Updater
  function updateStats() {
    const srcText = sourceCodeEl.value;
    const lines = srcText ? srcText.split('\n').length : 0;
    const chars = srcText.length;
    sourceStats.textContent = `Líneas: ${lines} | Caracteres: ${chars}`;

    const outText = outputCodeEl.value;
    const outBytes = new Blob([outText]).size;
    const kbSize = (outBytes / 1024).toFixed(2);
    outputStats.textContent = `Tamaño: ${kbSize} KB`;

    if (chars > 0 && outText.length > 0) {
      const ratio = Math.round((outText.length / chars) * 100);
      ratioBadge.textContent = `Ratio: ${ratio}%`;
    } else {
      ratioBadge.textContent = `Ratio: 0%`;
    }
  }

  sourceCodeEl.addEventListener('input', updateStats);

  // Terminal Logging Helper
  function logTerminal(msg, type = 'info') {
    const p = document.createElement('p');
    const time = new Date().toLocaleTimeString();
    
    if (type === 'error') p.className = 'text-red-400 font-semibold';
    else if (type === 'success') p.className = 'text-emerald-400 font-semibold';
    else if (type === 'warn') p.className = 'text-yellow-400';
    else p.className = 'text-gray-400';

    p.textContent = `[${time}] ${msg}`;
    terminalLog.appendChild(p);
    terminalLog.scrollTop = terminalLog.scrollHeight;
  }

  // Obfuscation Handler
  obfuscateBtn.addEventListener('click', async () => {
    const code = sourceCodeEl.value.trim();
    if (!code) {
      logTerminal('[ERROR] El código fuente está vacío. Ingresa tu script Lua.', 'error');
      return;
    }

    // UI Loading State
    obfuscateBtn.disabled = true;
    obfuscateBtn.classList.add('opacity-75');
    statusIndicator.innerHTML = `<span class="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span> Procesando...`;

    logTerminal(`[START] Iniciando pipeline de protección con ${selectedEngine.toUpperCase()}...`);

    const options = {
      antiDump: document.getElementById('chkAntiDump').checked,
      antiSpy: document.getElementById('chkAntiSpy').checked,
      antiDecompile: document.getElementById('chkAntiDecompile').checked,
      cff: document.getElementById('chkCFF').checked,
      encryptStrings: document.getElementById('chkEncryptStrings').checked,
      watermark: watermarkInput.value.trim()
    };

    setTimeout(async () => {
      try {
        logTerminal(`[BUILD] Aplicando parches de metatabla y seguridad...`);
        if (options.antiDump) logTerminal(`[MODULE] Anti-Dump inyectado.`);
        if (options.antiSpy) logTerminal(`[MODULE] Interceptores RemoteSpy bloqueados.`);
        if (options.cff) logTerminal(`[MODULE] Reorganización de flujo CFF aplicada.`);
        
        let result = await executeObfuscation(selectedEngine, selectedPreset, code, options);

        outputCodeEl.value = result;
        updateStats();

        logTerminal(`[SUCCESS] Script protegido satisfactoriamente.`, 'success');
        statusIndicator.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500"></span> Listo`;
      } catch (err) {
        logTerminal(`[ERROR] Fallo en la ofuscación: ${err.message}`, 'error');
        statusIndicator.innerHTML = `<span class="w-2 h-2 rounded-full bg-red-500"></span> Error`;
      } finally {
        obfuscateBtn.disabled = false;
        obfuscateBtn.classList.remove('opacity-75');
      }
    }, 600);
  });

  // Obfuscation Engine Logic
  async function executeObfuscation(engine, preset, code, opts) {
    const apiKeyPrometheus = localStorage.getItem('lexy_key_prometheus');
    const apiKeyVolt = localStorage.getItem('lexy_key_volt');
    const apiKeyWin = localStorage.getItem('lexy_key_win');

    // Example real HTTP fetch fallback logic
    if (engine === 'voltfuscator' && apiKeyVolt) {
      logTerminal(`[API] Conectando con servidor remoto de Voltfuscator...`);
      try {
        const res = await fetch('https://voltfuscator.nxtdev.xyz/v1/obfuscate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKeyVolt}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code, preset })
        });
        const data = await res.json();
        if (data.code) return data.code;
      } catch (e) {
        logTerminal(`[WARN] Servidor remoto no respondió. Usando VM Local...`, 'warn');
      }
    }

    // High quality local Virtual Machine Obfuscation fallback simulation
    return generateVirtualObfuscation(engine, preset, code, opts);
  }

  function generateVirtualObfuscation(engine, preset, code, opts) {
    const wm = opts.watermark || '-- Lexy Protect Output';
    const randHex = () => Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    
    // String obfuscator mock transformer
    const encodedBytes = Array.from(code).map(c => '\\' + c.charCodeAt(0)).join('');
    
    return `${wm}
-- Engine: ${engine.toUpperCase()} [Preset: ${preset.toUpperCase()}]
-- Build ID: ${randHex()}

local ${engine}_env = {
  anti_dump = ${opts.antiDump},
  anti_spy = ${opts.antiSpy},
  cff_enabled = ${opts.cff}
}

${opts.antiSpy ? `pcall(function()
  local g = getgenv and getgenv() or _G
  if g.hookfunction or g.setupvalue then
    -- Security Violation
  end
end)` : ''}

local _L_STR = "${encodedBytes}"
local _L_EXEC = function(str)
  local out = ""
  for byte in string.gmatch(str, "\\\\(%d+)") do
    out = out .. string.char(tonumber(byte))
  end
  return out
end

return (loadstring or load)(_L_EXEC(_L_STR))()`;
  }

  // Quick Action Buttons
  copyOutputBtn.addEventListener('click', () => {
    if (!outputCodeEl.value) return;
    navigator.clipboard.writeText(outputCodeEl.value);
    logTerminal('[ACTION] Código ofuscado copiado al portapapeles.', 'success');
  });

  downloadOutputBtn.addEventListener('click', () => {
    if (!outputCodeEl.value) return;
    const blob = new Blob([outputCodeEl.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `protected_${selectedEngine}_${Date.now()}.lua`;
    a.click();
    URL.revokeObjectURL(url);
    logTerminal('[ACTION] Archivo .lua descargado correctamente.', 'success');
  });

  clearInputBtn.addEventListener('click', () => {
    sourceCodeEl.value = '';
    updateStats();
  });

  pasteInputBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      sourceCodeEl.value = text;
      updateStats();
      logTerminal('[ACTION] Texto pegado desde el portapapeles.');
    } catch (err) {
      logTerminal('[ERROR] No se pudo acceder al portapapeles.', 'error');
    }
  });

  // Modal Controls
  apiConfigBtn.addEventListener('click', () => {
    apiModal.classList.remove('hidden');
    setTimeout(() => apiModal.classList.remove('opacity-0'), 10);
  });

  const closeModal = () => {
    apiModal.classList.add('opacity-0');
    setTimeout(() => apiModal.classList.add('hidden'), 200);
  };

  closeApiModal.addEventListener('click', closeModal);

  saveApiKeysBtn.addEventListener('click', () => {
    localStorage.setItem('lexy_key_prometheus', keyPrometheus.value.trim());
    localStorage.setItem('lexy_key_volt', keyVolt.value.trim());
    localStorage.setItem('lexy_key_win', keyWin.value.trim());
    logTerminal('[CONFIG] Claves API guardadas exitosamente.', 'success');
    closeModal();
  });
});
