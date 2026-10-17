function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var gwt = new GwtMessage();
    g_form.addInfoMessage(gwt.getMessage('Record estimate field updated with value based on the latest estimate. Restored records are not included in the estimate.'));

}
