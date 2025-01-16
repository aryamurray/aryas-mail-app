use tauri::{command, Emitter, Window};
use tauri_plugin_oauth::{start_with_config, OauthConfig};

#[command]
fn start_server(window: Window) -> Result<u16, String> {
    let config = OauthConfig {
        // Specify preferred ports - if one is busy, it'll try the next
        ports: Some(vec![12000, 12001, 12002]),
        // Custom response shown in browser after OAuth completion
        response: Some("Authentication successful! You can close this window.".into()),
    };

    start_with_config(config, move |url| {
        let _ = window.emit("redirect_uri", url);
    })
    .map_err(|err| err.to_string())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        // .plugin(tauri_plugin_store::Builder::new().build())
        // .setup(|app| {
        //     let store = app.store("creds.json")
        //     Ok(())
        // })
        .plugin(tauri_plugin_oauth::init())
        .invoke_handler(tauri::generate_handler![start_server])
        .run(tauri::generate_context!())
        .expect("error while running the application");
}
