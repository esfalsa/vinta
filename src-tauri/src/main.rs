#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

use chacha20poly1305::{
	aead::{ Aead, AeadCore, KeyInit, OsRng, generic_array::GenericArray },
	ChaCha20Poly1305,
};
use argon2::{
	password_hash::{ SaltString, PasswordHash, PasswordHasher, PasswordVerifier },
	Argon2,
};

#[derive(Debug, thiserror::Error)]
pub enum Error {
	#[error(transparent)] Argon2(#[from] argon2::Error),
	#[error(transparent)] Argon2hash(#[from] argon2::password_hash::Error),
	#[error(transparent)] FromUtf8Error(#[from] std::string::FromUtf8Error),
	#[error(transparent)] Chacha20poly1305(#[from] chacha20poly1305::Error),
	#[error(transparent)] InvalidLength(#[from] crypto_common::InvalidLength),
}

impl serde::Serialize for Error {
	fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: serde::ser::Serializer {
		serializer.serialize_str(self.to_string().as_ref())
	}
}

#[tauri::command]
fn encrypt(data: String, password: &[u8], salt: &[u8]) -> Result<(Vec<u8>, Vec<u8>), Error> {
	let key = get_key(password, salt)?;
	let cipher = ChaCha20Poly1305::new_from_slice(&key)?;
	let nonce = ChaCha20Poly1305::generate_nonce(&mut OsRng);
	let ciphertext = cipher.encrypt(&nonce, data.as_bytes())?;

	Ok((ciphertext, nonce.to_vec()))
}

#[tauri::command]
fn decrypt(data: Vec<u8>, password: &[u8], salt: &[u8], nonce: Vec<u8>) -> Result<String, Error> {
	let key = get_key(password, salt)?;
	let cipher = ChaCha20Poly1305::new_from_slice(&key)?;
	let nonce = GenericArray::from_slice(nonce.as_slice());
	let plaintext = cipher.decrypt(&nonce, data.as_slice())?;

	Ok(String::from_utf8(plaintext)?)
}

#[tauri::command]
fn generate_salt() -> Result<String, Error> {
	Ok(SaltString::generate(&mut OsRng).to_string())
}

#[tauri::command]
fn hash_password(password: &[u8]) -> Result<String, Error> {
	let salt = SaltString::generate(&mut OsRng);
	let argon2 = Argon2::default();

	Ok(argon2.hash_password(password, &salt)?.to_string())
}

#[tauri::command]
fn verify_password(password: &[u8], hash: String) -> Result<bool, Error> {
	let parsed_hash = PasswordHash::new(&hash)?;
	let argon2 = Argon2::default();

	Ok(argon2.verify_password(password, &parsed_hash).is_ok())
}

fn get_key(password: &[u8], salt: &[u8]) -> Result<[u8; 32], Error> {
	let argon2 = Argon2::default();
	let mut hash = [0u8; 32];

	argon2.hash_password_into(password, salt, &mut hash)?;

	Ok(hash)
}

fn main() {
	tauri::Builder
		::default()
		.invoke_handler(
			tauri::generate_handler![
				encrypt,
				decrypt,
				generate_salt,
				hash_password,
				verify_password
			]
		)
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}