function _showRESTControls() {
    g_form.setVisible('rest_service', true);
    g_form.setVisible('http_method', true);
	g_form.setSectionDisplay('web_services', true);
}

function onCondition() {
    var e = g_form.getControl('is_rest');
    if (e) {
	_showRESTControls();
    } else {
	// this block will execute if the control is not on the 
	// form, which is the case for BE
	_hideRESTControls();
    }		
}
