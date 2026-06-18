import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'

interface FeatureFlag {
  name: string
  enabled: boolean
  description: string
}

function App() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeatureFlags()
  }, [])

  async function loadFeatureFlags() {
    try {
      const flags = await invoke<FeatureFlag[]>('get_feature_flags')
      setFeatureFlags(flags)
    } catch (error) {
      console.error('Erro ao carregar feature flags:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleFlag(name: string, enabled: boolean) {
    try {
      await invoke('toggle_feature_flag', { name, enabled })
      setFeatureFlags(prev =>
        prev.map(flag =>
          flag.name === name ? { ...flag, enabled } : flag
        )
      )
    } catch (error) {
      console.error('Erro ao alternar feature flag:', error)
    }
  }

  if (loading) {
    return <div className="loading">Carregando OPIDE v2...</div>
  }

  return (
    <div className="app">
      <header className="header">
        <h1>OPIDE v2</h1>
        <p>IDE baseada em Tauri + Monaco Editor</p>
      </header>

      <main className="main">
        <section className="feature-flags">
          <h2>Feature Flags</h2>
          {featureFlags.length === 0 ? (
            <p>Nenhuma feature flag disponível</p>
          ) : (
            <ul>
              {featureFlags.map(flag => (
                <li key={flag.name} className="feature-flag-item">
                  <div className="feature-flag-info">
                    <strong>{flag.name}</strong>
                    <span>{flag.description}</span>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={flag.enabled}
                      onChange={(e) => toggleFlag(flag.name, e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="editor-placeholder">
          <h2>Editor</h2>
          <div className="placeholder-content">
            <p>O editor Monaco será inicializado aqui.</p>
            <p>Status: <span className="status">Aguardando inicialização...</span></p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>OPIDE v2 - Desenvolvido com Tauri, React e Monaco Editor</p>
      </footer>
    </div>
  )
}

export default App
