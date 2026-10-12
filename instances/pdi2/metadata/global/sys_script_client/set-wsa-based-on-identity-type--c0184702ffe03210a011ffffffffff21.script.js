function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var wsaField = "web_service_access_only";
    g_form.setValue(wsaField, newValue == "machine");
    var gwt = new GwtMessage();
    var wsaText = gwt.getMessage("This field is read-only. Please select 'Machine Identity' option in Identity type dropdown field if you want to mark this account as 'Web service access only'.");
    g_form.showFieldMsg(wsaField, wsaText, "info");
}
