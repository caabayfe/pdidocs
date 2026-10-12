function cancell() {
	if (g_form.getValue('state') != 'running') {
		alert(new GwtMessage().getMessage('Already Finished'));
		return;
	}

	var response = confirm(new GwtMessage().getMessage("Are you sure you want to cancel?"));
    if (response != true)
		return;

	cancellUploading();
}
