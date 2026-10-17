function onLoad() {
    if (g_form.getValue('wait_time') === '')
        g_form.setVisible('wait_time', false);

    if (g_form.getValue('duration') === '')
        g_form.setVisible('duration', false);
}
