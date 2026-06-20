import { invoke } from '@tauri-apps/api/core';
import type { PlayerStats } from '../services/edu-progress';

export function useLMSExport() {
  const exportToCSV = async (stats: PlayerStats): Promise<string> => {
    try {
      const statsJson = JSON.stringify(stats);
      return await invoke<string>('export_csv', { statsJson });
    } catch (error) {
      console.error('Failed to export CSV:', error);
      throw new Error('Export CSV failed');
    }
  };

  const exportToSCORM = async (stats: PlayerStats): Promise<string> => {
    try {
      const statsJson = JSON.stringify(stats);
      return await invoke<string>('export_scorm', { statsJson });
    } catch (error) {
      console.error('Failed to export SCORM:', error);
      throw new Error('Export SCORM failed');
    }
  };

  const generateLMSReport = async (stats: PlayerStats, formatType: 'html' | 'text'): Promise<string> => {
    try {
      const statsJson = JSON.stringify(stats);
      return await invoke<string>('generate_report', { statsJson, formatType });
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw new Error('Report generation failed');
    }
  };

  return {
    exportToCSV,
    exportToSCORM,
    generateLMSReport
  };
}
