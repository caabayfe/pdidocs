function onLoad() {
	var url = new GlideURL(window.location.href);
	var urlParams = url.getParams();
	
	if (url.getParam('from_record_producer') == 'true') {
		g_form.addInfoMessage('Export Set, ' + g_form.getDisplayValue('export_set') + ' , is created. You can use this form to make further changes to '+ g_form.getDisplayValue('export_set'));
	}
}
