function openRegistry() {
    if (g_form.getValue("parent") == '')
        window.open("nowmq_registry_view.do?format=xml&root_token=" + g_form.getValue("root_token"), '_blank');
    else
        window.open("nowmq_registry_view.do?format=xml&root_token=" + g_form.getValue("root_token") + "&subject_name=" + g_form.getValue("subject_name"), '_blank');
}
