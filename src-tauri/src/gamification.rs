use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::{Read, Write};
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct PlayerStats {
    pub xp: u32,
    pub level: u32,
    pub achievements: Vec<String>,
}

impl Default for PlayerStats {
    fn default() -> Self {
        Self {
            xp: 0,
            level: 1,
            achievements: Vec::new(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct LeaderboardEntry {
    pub name: String,
    pub xp: u32,
    pub level: u32,
}

fn get_progress_file_path() -> PathBuf {
    PathBuf::from(".opide_edu_progress.json")
}

fn get_leaderboard_file_path() -> PathBuf {
    PathBuf::from(".opide_leaderboard.json")
}

fn load_stats() -> PlayerStats {
    let path = get_progress_file_path();
    if !path.exists() {
        return PlayerStats::default();
    }
    let mut file = match File::open(&path) {
        Ok(f) => f,
        Err(_) => return PlayerStats::default(),
    };
    let mut content = String::new();
    if file.read_to_string(&mut content).is_ok() {
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        PlayerStats::default()
    }
}

fn save_stats(stats: &PlayerStats) -> Result<(), String> {
    let path = get_progress_file_path();
    let content = serde_json::to_string_pretty(stats).map_err(|e| e.to_string())?;
    let mut file = File::create(&path).map_err(|e| e.to_string())?;
    file.write_all(content.as_bytes()).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_player_stats() -> Result<PlayerStats, String> {
    Ok(load_stats())
}

#[tauri::command]
pub fn add_xp(amount: u32) -> Result<PlayerStats, String> {
    let mut stats = load_stats();
    stats.xp += amount;
    
    // Simple level up formula: 100 XP per level
    let new_level = (stats.xp / 100) + 1;
    if new_level > stats.level {
        stats.level = new_level;
        // Automatically unlock level-up achievement
        let achievement_id = format!("level_{}", new_level);
        if !stats.achievements.contains(&achievement_id) {
            stats.achievements.push(achievement_id);
        }
    }
    
    save_stats(&stats)?;
    
    // Also update leaderboard entry for local user
    let mut leaderboard = load_leaderboard();
    if let Some(entry) = leaderboard.iter_mut().find(|e| e.name == "Estudante (Você)") {
        entry.xp = stats.xp;
        entry.level = stats.level;
    } else {
        leaderboard.push(LeaderboardEntry {
            name: "Estudante (Você)".to_string(),
            xp: stats.xp,
            level: stats.level,
        });
    }
    save_leaderboard(&leaderboard)?;
    
    Ok(stats)
}

#[tauri::command]
pub fn unlock_achievement(id: String) -> Result<PlayerStats, String> {
    let mut stats = load_stats();
    if !stats.achievements.contains(&id) {
        stats.achievements.push(id);
        save_stats(&stats)?;
    }
    Ok(stats)
}

fn load_leaderboard() -> Vec<LeaderboardEntry> {
    let path = get_leaderboard_file_path();
    if !path.exists() {
        // Return dummy leaderboard data initially
        return vec![
            LeaderboardEntry { name: "Estudante (Você)".to_string(), xp: 0, level: 1 },
            LeaderboardEntry { name: "Ana Clara".to_string(), xp: 450, level: 5 },
            LeaderboardEntry { name: "Lucas Silva".to_string(), xp: 320, level: 4 },
            LeaderboardEntry { name: "Beatriz Oliveira".to_string(), xp: 210, level: 3 },
            LeaderboardEntry { name: "Gabriel Souza".to_string(), xp: 90, level: 1 },
        ];
    }
    let mut file = match File::open(&path) {
        Ok(f) => f,
        Err(_) => return Vec::new(),
    };
    let mut content = String::new();
    if file.read_to_string(&mut content).is_ok() {
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        Vec::new()
    }
}

fn save_leaderboard(leaderboard: &[LeaderboardEntry]) -> Result<(), String> {
    let path = get_leaderboard_file_path();
    let content = serde_json::to_string_pretty(leaderboard).map_err(|e| e.to_string())?;
    let mut file = File::create(&path).map_err(|e| e.to_string())?;
    file.write_all(content.as_bytes()).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_leaderboard() -> Result<Vec<LeaderboardEntry>, String> {
    let mut board = load_leaderboard();
    board.sort_by(|a, b| b.xp.cmp(&a.xp));
    Ok(board)
}

#[tauri::command]
pub fn mark_onboarding_complete() -> Result<(), String> {
    let mut stats = load_stats();
    if !stats.achievements.contains(&"onboarding_complete".to_string()) {
        stats.achievements.push("onboarding_complete".to_string());
        let _ = save_stats(&stats);
    }
    Ok(())
}

#[tauri::command]
pub fn create_edu_project(template_id: String, _project_name: String) -> Result<(), String> {
    let (file_name, content) = match template_id.as_str() {
        "ola-mundo" => ("main.py", "print(\"Olá, mundo!\")\n"),
        "calculadora" => ("main.js", "console.log(\"Calculadora Iniciada\");\n"),
        "turtle" => ("turtle_draw.py", "import turtle\nt = turtle.Turtle()\nt.forward(100)\nturtle.done()\n"),
        "java" => ("Main.java", "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Olá, Java!\");\n    }\n}\n"),
        "cpp" => ("main.cpp", "#include <iostream>\n\nint main() {\n    std::cout << \"Olá, C++!\" << std::endl;\n    return 0;\n}\n"),
        "go" => ("main.go", "package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Olá, Go!\")\n}\n"),
        _ => ("main.py", "print(\"Olá, mundo!\")\n")
    };

    let path = PathBuf::from(file_name);
    let mut file = File::create(&path).map_err(|e| e.to_string())?;
    file.write_all(content.as_bytes()).map_err(|e| e.to_string())?;
    Ok(())
}
