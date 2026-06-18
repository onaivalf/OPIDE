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
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '400px',
      background: '#1e1e1e',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
      padding: '24px',
      zIndex: 10000,
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#81c784', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📤 Exportar para LMS
        </h3>
        <button onClick={onClose} style={{
          background: 'none',
          border: 'none',
          color: '#aaa',
          fontSize: '18px',
          cursor: 'pointer'
        }}>✕</button>
      </div>

      <p style={{ fontSize: '13px', color: '#b0bec5', marginBottom: '20px' }}>
        Escolha o formato de exportação para integrar com Moodle, Canvas ou outras plataformas de ensino.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <button onClick={handleExportCSV} style={{
          padding: '12px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          color: '#fff',
          cursor: 'pointer',
          textAlign: 'left',
          fontWeight: 'bold'
        }}>
          📊 Exportar Notas e Progresso (CSV)
        </button>

        <button onClick={handleExportSCORM} style={{
          padding: '12px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          color: '#fff',
          cursor: 'pointer',
          textAlign: 'left',
          fontWeight: 'bold'
        }}>
          📦 Exportar Pacote SCORM 1.2
        </button>

        <button onClick={() => handleExportReport('html')} style={{
          padding: '12px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          color: '#fff',
          cursor: 'pointer',
          textAlign: 'left',
          fontWeight: 'bold'
        }}>
          📄 Gerar Relatório de Desempenho (HTML)
        </button>
      </div>

      {status && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '6px',
          background: 'rgba(255,255,255,0.02)',
          fontSize: '12px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ fontWeight: 'bold', color: status.includes('Erro') ? '#f44336' : '#81c784' }}>
            {status}
          </div>
          {exportPath && (
            <div style={{ marginTop: '4px', wordBreak: 'break-all', color: '#b0bec5' }}>
              Salvo em: <code>{exportPath}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
