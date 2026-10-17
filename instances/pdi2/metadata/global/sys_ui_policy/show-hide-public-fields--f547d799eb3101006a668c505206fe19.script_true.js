function onCondition() {
    g_form.hideFieldMsg('url_suffix', true);
    if (document.getElementById('process_strength_configuration'))
        document.getElementById('process_strength_configuration').style.display = 'none';
}
