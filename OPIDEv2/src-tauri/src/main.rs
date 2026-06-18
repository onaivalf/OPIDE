#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FeatureFlag {
    pub name: String,
    pub enabled: bool,
    pub description: String,
}

#[tauri::command]
fn get_feature_flags() -> Vec<FeatureFlag> {
    vec![
        FeatureFlag {
            name: String::from("experimental_editor"),
            enabled: false,
            description: String::from("Habilita recursos experimentais do editor"),
        },
        FeatureFlag {
            name: String::from("ai_assistant"),
            enabled: false,
            description: String::from("Habilita assistente de IA"),
        },
        FeatureFlag {
            name: String::from("multi_cursor_enhanced"),
            enabled: true,
            description: String::from("Melhorias no suporte a múltiplos cursores"),
        },
    ]
}

#[tauri::command]
fn toggle_feature_flag(name: String, enabled: bool) -> Result<(), String> {
    // Implementação futura para persistir flags
    println!("Feature flag '{}' toggled to {}", name, enabled);
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_feature_flags, toggle_feature_flag])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
