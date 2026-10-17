function onSubmit() {
    var durationVal = g_form.getValue('due_in');
    if (durationVal && durationVal.includes('-')) {
		g_form.hideFieldMsg('due_in');
        getMessage('Please enter a positive duration value', function(translatedMsg) {
            g_form.showFieldMsg('due_in', translatedMsg, 'error');
        });
        return false;
    }
}
