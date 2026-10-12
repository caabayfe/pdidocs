function closeTemplateModal() {
	if (CustomEvent){
		CustomEvent.fireAll('closeTemplateModal');
	}
}
