import React from 'react'
import { useExerciseVerifier, type ExerciseResult } from '../../hooks/useExerciseVerifier'

interface ExercisePanelProps {
  exerciseId: string
  initialCode: string
  onCodeChange: (code: string) => void
}

export const ExercisePanel: React.FC<ExercisePanelProps> = ({
  exerciseId,
  initialCode,
  onCodeChange
}) => {
  const { verifying, result, error, verify, reset } = useExerciseVerifier()
  const [code, setCode] = React.useState(initialCode)

  const handleSubmit = async () => {
    await verify(exerciseId, code)
  }

  const handleRetry = () => {
    reset()
    setCode(initialCode)
  }

  return (
    <div className="exercise-panel">
      <div className="exercise-header">
        <h3>Verificação de Exercício</h3>
      </div>

      <div className="exercise-content">
        {/* Área de código seria integrada com Monaco Editor */}
        <div className="code-area">
          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              onCodeChange(e.target.value)
            }}
            placeholder="Escreva sua solução aqui..."
            disabled={verifying}
          />
        </div>

        {/* Botões de ação */}
        <div className="exercise-actions">
          {!result ? (
            <button 
              onClick={handleSubmit} 
              disabled={verifying || !code.trim()}
              className="btn-primary"
            >
              {verifying ? 'Verificando...' : 'Enviar Solução'}
            </button>
          ) : (
            <button 
              onClick={handleRetry}
              className="btn-secondary"
            >
              Tentar Novamente
            </button>
          )}
        </div>

        {/* Resultados */}
        {error && (
          <div className="exercise-error">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {result && (
          <div className={`exercise-result ${result.passed ? 'success' : 'failure'}`}>
            <div className="result-header">
              <span className="result-icon">
                {result.passed ? '🎉' : '⚠️'}
              </span>
              <span className="result-title">
                {result.passed ? 'Parabéns!' : 'Quase lá!'}
              </span>
            </div>

            <div className="result-stats">
              <div className="stat">
                <span className="stat-label">Testes:</span>
                <span className="stat-value">
                  {result.tests_passed}/{result.tests_total}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Pontuação:</span>
                <span className="stat-value">
                  {result.score.toFixed(1)}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Tempo:</span>
                <span className="stat-value">
                  {result.execution_time_ms}ms
                </span>
              </div>
            </div>

            <div className="result-feedback">
              <strong>Feedback:</strong>
              <p>{result.feedback}</p>
            </div>

            {result.error_message && (
              <div className="result-errors">
                <strong>Erros encontrados:</strong>
                <pre>{result.error_message}</pre>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .exercise-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--editor-background);
          border-left: 1px solid var(--border-color);
        }

        .exercise-header {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          background: var(--sidebar-background);
        }

        .exercise-header h3 {
          margin: 0;
          font-size: 1rem;
          color: var(--text-color);
        }

        .exercise-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 1rem;
          overflow-y: auto;
        }

        .code-area {
          flex: 1;
          margin-bottom: 1rem;
        }

        .code-area textarea {
          width: 100%;
          height: 200px;
          padding: 0.75rem;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.875rem;
          background: var(--input-background);
          color: var(--text-color);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          resize: vertical;
        }

        .code-area textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .exercise-actions {
          margin-bottom: 1rem;
        }

        .exercise-actions button {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          font-weight: 600;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #007acc;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #005a9e;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        .exercise-error {
          padding: 1rem;
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid #dc3545;
          border-radius: 4px;
          color: #dc3545;
          margin-bottom: 1rem;
        }

        .exercise-result {
          padding: 1rem;
          border-radius: 4px;
          border: 1px solid;
        }

        .exercise-result.success {
          background: rgba(40, 167, 69, 0.1);
          border-color: #28a745;
          color: #28a745;
        }

        .exercise-result.failure {
          background: rgba(255, 193, 7, 0.1);
          border-color: #ffc107;
          color: #856404;
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .result-icon {
          font-size: 1.5rem;
        }

        .result-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .stat-label {
          font-size: 0.75rem;
          opacity: 0.8;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1rem;
          font-weight: 600;
        }

        .result-feedback {
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .result-feedback p {
          margin: 0.5rem 0 0 0;
        }

        .result-errors {
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(220, 53, 69, 0.05);
          border-radius: 4px;
        }

        .result-errors pre {
          margin: 0.5rem 0 0 0;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
          font-size: 0.8rem;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-word;
        }
      `}</style>
    </div>
  )
}
