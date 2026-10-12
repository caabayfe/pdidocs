function onLoad() {
    if (g_form.getValue('type') != 'cloud_file')
        g_form.removeOption('type', 'cloud_file');
}
