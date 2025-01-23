use tauri::{command, Emitter, Window};
use tauri_plugin_oauth::{start_with_config, OauthConfig};
use std::net::TcpListener;

#[command]
fn start_server(window: Window) -> Result<u16, String> {
    let config = OauthConfig {
        // Specify preferred ports - if one is busy, it'll try the next
        ports: Some(vec![8889, 8890]),
        // Custom response shown in browser after OAuth completion
        response: Some("Authentication successful! You can close this window.".into()),
    };

    // Iterate through the preferred ports and check availability
    for port in &config.ports.unwrap() {
        if !is_port_busy(*port) {
            // Port is available, start the server
            return start_with_config(
                OauthConfig {
                    ports: Some(vec![*port]), // Use only the available port
                    response: config.response.clone(),
                },
                move |url| {
                    let _ = window.emit("redirect_uri", url);
                },
            )
            .map(|_| *port) // Return the port number on success
            .map_err(|err| err.to_string());
        }
    }

    // If no ports are available, return an error
    Err("All specified ports are busy".into())
}

fn is_port_busy(port: u16) -> bool {
    // Try to bind to the port using a TcpListener
    match TcpListener::bind(("127.0.0.1", port)) {
        Ok(listener) => {
            // Port is free, drop the listener
            drop(listener);
            false
        }
        Err(_) => true, // Port is busy
    }
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_deep_link::init())
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
