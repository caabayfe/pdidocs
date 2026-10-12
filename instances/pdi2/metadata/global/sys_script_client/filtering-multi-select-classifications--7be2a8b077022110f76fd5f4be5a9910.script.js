function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '' || newValue.length < oldValue.length) {
        return;
    }
    var ajax = new GlideAjax("ClassficationTagUtilAjax");
    ajax.addParam("sysparm_name", "removeDuplicatesOfSameGroup");
    ajax.addParam("sysparm_recordId", g_form.getUniqueValue());
    ajax.addParam("sysparm_newValue", newValue);
    ajax.getXMLAnswer(function(response) {
		if (response != null && response != '') {
			var responseData = JSON.parse(response);
			if(responseData.status === 'ok'){
				if(responseData.content.indexOf(',')==0)
					g_form.setValue('classification',responseData.content.substring(1));
				else g_form.setValue('classification',responseData.content);
			}
		}
	});
}
