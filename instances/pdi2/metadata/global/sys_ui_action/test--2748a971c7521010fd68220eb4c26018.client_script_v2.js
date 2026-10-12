function onClick(g_form) {
    var sysId = g_form.getUniqueValue();
    var url = '/$conversation-builder.do#/preview?sysparm_global_context_profile=' + sysId;
	var modelType = g_form.getValue('model_type');
	if (modelType == 'nowassistpanel') {
		url += '&sysparm_nowassistpanel=true';
	} else if (modelType == 'llm') {
		url += '&sysparm_nowassist=true';
	}
    openUrl(url);
}

function openUrl(url) {
    this.open(url, 'preview-client', 'width=750,height=600');
}
