function onLoad(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    g_form.addInfoMessage(getMessage("RemoteTable::warn_user_of_integration_hub_consequence"));

}
