import React, { useState } from 'react';
import { useGamification } from '../hooks/useGamification';
import { useLMSExport } from '../hooks/useLMSExport';

interface LMSExportPanelProps {
  onClose: () => void;
}

export function LMSExportPanel({ onClose }: LMSExportPanelProps) {
  const { stats } = useGamification();
  const { exportToCSV, exportToSCORM, generateLMSReport } = useLMSExport();
  const [status, setStatus] = useState<string | null>(null);
  const [exportPath, setExportPath] = useState<string | null>(null);

  const handleExportCSV = async () => {
    try {
      setStatus('Exportando CSV...');
      const path = await exportToCSV(stats);
      setExportPath(path);
      setStatus('Sucesso! CSV exportado.');
    } catch (e) {
      setStatus('Erro ao exportar CSV.');
    }
  };

  const handleExportSCORM = async () => {
    try {
      setStatus('Exportando SCORM...');
      const path = await exportToSCORM(stats);
      setExportPath(path);
      setStatus('Sucesso! Manifesto SCORM exportado.');
    } catch (e) {
      setStatus('Erro ao exportar SCORM.');
    }
  };

  const handleExportReport = async (format: 'html' | 'text') => {
    try {
      setStatus(`Gerando relatório ${format.toUpperCase()}...`);
      const path = await generateLMSReport(stats, format);
      setExportPath(path);
      setStatus('Sucesso! Relatório gerado.');
    } catch (e) {
      setStatus('Erro ao gerar relatório.');
    }
  };

  return (
    <div className="edu-modal-container">
      <div className="edu-modal-header">
        <h3 className="edu-modal-title lms">
          📤 Exportar para LMS
        </h3>
        <button onClick={onClose} className="edu-modal-close-btn">✕</button>
      </div>

      <p className="edu-modal-description">
        Escolha o formato de exportação para integrar com Moodle, Canvas ou outras plataformas de ensino.
      </p>

      <div className="lms-btn-group">
        <button onClick={handleExportCSV} className="lms-export-btn">
          📊 Exportar Notas e Progresso (CSV)
        </button>

        <button onClick={handleExportSCORM} className="lms-export-btn">
          📦 Exportar Pacote SCORM 1.2
        </button>

        <button onClick={() => handleExportReport('html')} className="lms-export-btn">
          📄 Gerar Relatório de Desempenho (HTML)
        </button>
      </div>

      {status && (
        <div className="lms-status-box">
          <div className={`lms-status-text ${status.includes('Erro') ? 'error' : 'success'}`}>
            {status}
          </div>
          {exportPath && (
            <div className="lms-status-path">
              Salvo em: <code>{exportPath}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
