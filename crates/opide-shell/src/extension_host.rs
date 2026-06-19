use tauri::{AppHandle, State, command};
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize)]
pub struct ExtHostState {}

impl ExtHostState {
    pub fn new() -> Self {
        Self {}
    }
}

#[derive(Debug, Deserialize)]
pub struct StartRequest {
    pub extensions_path: String,
    pub workspace_path: String,
}

#[command]
pub async fn ext_host_start(
    _app: AppHandle,
    _state: State<'_, ExtHostState>,
    request: StartRequest,
) -> Result<(), String> {
    log::info!("Mock extension host started. workspace: {}, extensions: {}", request.workspace_path, request.extensions_path);
    Ok(())
}

#[command]
pub async fn ext_host_send(
    _state: State<'_, ExtHostState>,
    _message: String,
) -> Result<(), String> {
    Ok(())
}

#[command]
pub async fn ext_host_stop(
    _app: AppHandle,
    _state: State<'_, ExtHostState>,
) -> Result<(), String> {
    log::info!("Mock extension host stopped");
    Ok(())
}

#[command]
pub async fn ext_host_status(
    _state: State<'_, ExtHostState>,
) -> Result<String, String> {
    Ok("ready".to_string())
}

#[command]
pub async fn ext_host_log(
    message: String,
) -> Result<(), String> {
    log::info!("[ext-host-log] {}", message);
    Ok(())
}
