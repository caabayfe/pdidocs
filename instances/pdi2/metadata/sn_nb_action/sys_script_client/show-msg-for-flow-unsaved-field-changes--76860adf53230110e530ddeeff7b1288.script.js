function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue == '9ac9cdd153530110e530ddeeff7b1228') {
        getMessage('The recommendations using a flow generator only get refreshed when users save their context records.', function(translatedMsg) {
            g_form.addInfoMessage(translatedMsg);
        });
    } else if (!isLoading) {
        g_form.clearMessages();
    }
}
