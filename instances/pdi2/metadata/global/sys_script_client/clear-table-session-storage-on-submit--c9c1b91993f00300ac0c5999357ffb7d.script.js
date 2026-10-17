function onSubmit() {
	// Remove existing session storage when the table is updated so new values will take effect.
	var tableSessionStorageName = 'saColorsIconsStorage';
	window.sessionStorage.removeItem(tableSessionStorageName);
}
