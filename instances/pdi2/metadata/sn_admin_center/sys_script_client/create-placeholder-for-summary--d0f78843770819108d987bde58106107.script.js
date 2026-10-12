function onLoad() {
    var summaryField = g_form.getControl('summary');
	var summaryPlaceholder = getMessage("Enter a description preferably up to 40 words");
	summaryField.placeholder = summaryPlaceholder;
}
