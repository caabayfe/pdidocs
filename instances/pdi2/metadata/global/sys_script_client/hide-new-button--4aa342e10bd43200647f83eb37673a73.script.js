function onLoad() {
	var isPublished = g_form.getValue("wf_workflow_version.published");
	if(isPublished == "true") {
		$j('#sysverb_embedded_list_new').ready(function(){$j('#sysverb_embedded_list_new').hide()});
	}
}
