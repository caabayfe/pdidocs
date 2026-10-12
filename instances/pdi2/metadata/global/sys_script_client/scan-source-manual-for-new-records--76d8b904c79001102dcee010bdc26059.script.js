function onLoad() {
   // Set the 'Scan source' column to 'Manual' for new records created through the UI (IE - User pressed "New" button)
	if (g_form.isNewRecord()) {
		g_form.setValue("scan_source", "manual");
	}
}
