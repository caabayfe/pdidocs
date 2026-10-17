function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var displayEditor = newValue == 'records' ? 'block' : 'none';
	var editor = $("label.sp_portal_menu.record_script").up();
	editor.setStyle({'display': displayEditor});   
}
