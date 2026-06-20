import './global.css'
import { initializeWorkbench, initializeDeferredFeatures } from './workbench.ts'
import { isEduMode } from './components/EduToggle'

/**
 * FASE-03: Lazy loading de Monaco services
 * Carrega serviços do Monaco sob demanda apenas em modo PRO ou quando necessário
 */
async function loadMonacoServicesLazy() {
  // Em modo EDU, carrega apenas o essencial
  if (isEduMode()) {
    console.log('[FASE-03] EDU Mode: Loading minimal Monaco services')
    // Apenas editor básico e linguagem simples
    return import('@codingame/monaco-vscode-editor-service-override').then(() => {
      console.log('[FASE-03] Minimal editor loaded')
    })
  }
  
  // Em modo PRO, carrega todos os serviços sob demanda
  console.log('[FASE-03] PRO Mode: Loading Monaco services lazily')
  
  const servicePromises = [
    // Core editor (sempre carrega)
    import('@codingame/monaco-vscode-editor-service-override'),
    
    // Language services (lazy - só quando abrir arquivo de código)
    new Promise(resolve => {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) {
          import('@codingame/monaco-vscode-languages-service-override')
            .then(() => console.log('[FASE-03] Language services loaded'))
            .catch(console.warn)
          observer.disconnect()
          resolve(undefined)
        }
      }, { threshold: 0.1 })
      
      observer.observe(document.body)
      // Timeout de segurança: carrega após 2s se não houver interação
      setTimeout(() => {
        observer.disconnect()
        import('@codingame/monaco-vscode-languages-service-override')
          .then(() => console.log('[FASE-03] Language services loaded (timeout)'))
          .catch(console.warn)
        resolve(undefined)
      }, 2000)
    }),
    
    // Theme service (lazy - após 1s)
    new Promise(resolve => {
      setTimeout(() => {
        import('@codingame/monaco-vscode-theme-service-override')
          .then(() => console.log('[FASE-03] Theme service loaded'))
          .catch(console.warn)
        resolve(undefined)
      }, 1000)
    }),
  ]
  
  await Promise.all(servicePromises)
}

async function boot() {
  try {
    // Phase 1: Core workbench — must complete before showing UI
    await initializeWorkbench()

    // Hide the loading screen IMMEDIATELY after workbench shell is ready
    const loading = document.getElementById('workbench-loading')
    if (loading) {
      loading.classList.add('hidden')
      setTimeout(() => loading.remove(), 400)
    }

    // FASE-03: Lazy load Monaco services antes de inicializar features deferidas
    await loadMonacoServicesLazy().catch(err => {
      console.warn('[FASE-03] Monaco lazy loading failed:', err)
    })

    // Phase 2: AI features, extensions, MCP, indexing — runs AFTER UI is visible
    // User sees the IDE immediately. Activity feed shows progress of deferred features.
    initializeDeferredFeatures().catch(err => {
      console.warn('[OPIDE] Deferred features failed:', err)
      showStartupError(`Some IDE features failed to load: ${err}`)
    })

    // Mount EduModeManager React components to handle educational features
    try {
      const { createElement } = await import('react')
      const { createRoot } = await import('react-dom/client')
      const { EduModeManager } = await import('./components/EduModeManager')
      
      let eduRoot = document.getElementById('opide-edu-root')
      if (!eduRoot) {
        eduRoot = document.createElement('div')
        eduRoot.id = 'opide-edu-root'
        document.body.appendChild(eduRoot)
      }
      
      const root = createRoot(eduRoot)
      root.render(createElement(EduModeManager))
      console.log('[OPIDE] EduModeManager mounted successfully')
    } catch (err) {
      console.warn('[OPIDE] Failed to mount EduModeManager:', err)
    }
  } catch (err) {
    console.error('[OPIDE] Workbench initialization failed:', err)
    const loading = document.getElementById('workbench-loading')
    if (loading) {
      loading.innerHTML = `
        <div style="text-align:center;color:#f88;font-family:var(--opide-font-mono);padding:24px">
          <div style="font-size:18px;margin-bottom:8px">Workbench failed to start</div>
          <div style="font-size:12px;opacity:0.7">${String(err)}</div>
        </div>
      `
    }
  }
}

// B35: surface deferred-features failures via a small floating banner so the
// user has at least a hint when something silently broke (chat panel, MCP,
// extensions, etc.). Console logs alone aren't visible to most users.
function showStartupError(msg: string): void {
  try {
    const banner = document.createElement('div')
    banner.style.cssText = 'position:fixed;bottom:12px;right:12px;background:#3a1f1f;color:#f88;padding:8px 12px;border-radius:6px;font-size:11px;font-family:var(--opide-font-mono);z-index:9999;max-width:380px;box-shadow:0 4px 12px rgba(0,0,0,0.4)'
    banner.textContent = msg
    document.body.appendChild(banner)
    setTimeout(() => banner.remove(), 12_000)
  } catch { /* DOM may not be ready */ }
}

boot()
