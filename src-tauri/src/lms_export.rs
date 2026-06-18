use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::Write;
use std::path::PathBuf;

#[tauri::command]
pub fn export_csv(stats_json: String) -> Result<String, String> {
    // Deserialize stats to convert to CSV
    // Simple format: Metric,Value
    // Example: XP,350
    // Level,4
    // Achievements,first_run;first_test
    
    let stats: serde_json::Value = serde_json::from_str(&stats_json).map_err(|e| e.to_string())?;
    
    let mut csv = String::new();
    csv.push_str("Métrica,Valor\n");
    if let Some(xp) = stats.get("xp") {
        csv.push_str(&format!("XP,{}\n", xp));
    }
    if let Some(level) = stats.get("level") {
        csv.push_str(&format!("Nível,{}\n", level));
    }
    if let Some(achievements) = stats.get("achievements").and_then(|a| a.as_array()) {
        let list: Vec<String> = achievements.iter().map(|v| v.as_str().unwrap_or("").to_string()).collect();
        csv.push_str(&format!("Conquistas,\"{}\"\n", list.join(";")));
    }
    
    let path = PathBuf::from("opide_lms_export.csv");
    let mut file = File::create(&path).map_err(|e| e.to_string())?;
    file.write_all(csv.as_bytes()).map_err(|e| e.to_string())?;
    
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn export_scorm(stats_json: String) -> Result<String, String> {
    // Generate a simulated SCORM 1.2 XML metadata manifest + progress state
    let stats: serde_json::Value = serde_json::from_str(&stats_json).map_err(|e| e.to_string())?;
    let xp = stats.get("xp").and_then(|x| x.as_u64()).unwrap_or(0);
    let level = stats.get("level").and_then(|l| l.as_u64()).unwrap_or(1);
    
    let manifest = format!(r#"<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="OPIDE-Edu-SCORM" version="1.1"
          xmlns="http://www.cnr.it/ia/imsmd_v1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="OPIDE_ORG">
    <organization identifier="OPIDE_ORG">
      <title>OPIDE Progress Export</title>
      <item identifier="item_1" identifierref="resource_1">
        <title>Progresso do Aluno (XP: {}, Nível: {})</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="resource_1" type="webcontent" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>"#, xp, level);

    let path = PathBuf::from("imsmanifest.xml");
    let mut file = File::create(&path).map_err(|e| e.to_string())?;
    file.write_all(manifest.as_bytes()).map_err(|e| e.to_string())?;
    
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn generate_report(stats_json: String, format_type: String) -> Result<String, String> {
    let stats: serde_json::Value = serde_json::from_str(&stats_json).map_err(|e| e.to_string())?;
    let xp = stats.get("xp").and_then(|x| x.as_u64()).unwrap_or(0);
    let level = stats.get("level").and_then(|l| l.as_u64()).unwrap_or(1);
    
    let report = if format_type.to_lowercase() == "html" {
        format!(r#"<html>
<head><title>Relatório OPIDE Edu</title></head>
<body style="font-family:sans-serif; padding: 20px;">
  <h2>Relatório de Desempenho do Estudante</h2>
  <hr/>
  <p><strong>Nível:</strong> {}</p>
  <p><strong>XP total acumulado:</strong> {}</p>
  <p>Exportado automaticamente pelo OPIDE Edu.</p>
</body>
</html>"#, level, xp)
    } else {
        format!("RELATÓRIO DE DESEMPENHO - OPIDE EDU\n===================================\nNível: {}\nXP: {}\n", level, xp)
    };

    let filename = if format_type.to_lowercase() == "html" { "opide_report.html" } else { "opide_report.txt" };
    let path = PathBuf::from(filename);
    let mut file = File::create(&path).map_err(|e| e.to_string())?;
    file.write_all(report.as_bytes()).map_err(|e| e.to_string())?;
    
    Ok(path.to_string_lossy().to_string())
}
