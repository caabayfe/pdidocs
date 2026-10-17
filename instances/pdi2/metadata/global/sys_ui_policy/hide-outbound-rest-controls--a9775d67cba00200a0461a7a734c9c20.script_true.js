function _hideRESTControls()  {
    g_form.setVisible('rest_service', false);
    g_form.setVisible('http_method', false);
	g_form.setSectionDisplay('web_services', false);
}

function onCondition() {
    _hideRESTControls();
}
