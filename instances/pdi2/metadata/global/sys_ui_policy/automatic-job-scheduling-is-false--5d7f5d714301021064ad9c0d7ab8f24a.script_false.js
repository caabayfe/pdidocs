function onCondition() {
    // if the provider is NowMQ Provider
    if (g_form.getValue('provider') == '3ccf4464431212108da9a574a9b8f2fb') {
        g_form.setDisplay('processing_order', false);
        g_form.setDisplay('job_config', false);
    }
}
