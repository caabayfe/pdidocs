function onLoad(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (!(g_form.getValue("scriptable_table") == "true") || !g_form.isNewRecord())
        return;

    g_form.addInfoMessage(getMessage("RemoteTable::warn_user_of_integration_hub_consequence"));

}
