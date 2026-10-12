function loadAllMultisourceResults() {
	
	var loadingDialog = new GlideDialogWindow("dialog_loading", true);
	loadingDialog.setPreference('table', 'loading');
	loadingDialog.setTitle(''); 
    var query = g_list.getQuery();
    var ga = new GlideAjax('MultisourceResultStatus'); //Call script include to parse execution id
    ga.addParam('sysparm_name', 'getExecutionIdForClient'); // method name in script include
    ga.addParam('sysparm_query', query); // parameter name
    ga.getXML(ExecutionIdParse);

    // the callback function for returning the result from the server-side code
    function ExecutionIdParse(response) {
        var executionId = response.responseXML.documentElement.getAttribute("answer");
        if (executionId === '') {
            g_GlideUI.addOutputMessage({
                'msg': getMessage('Error Loading more. Please set the filter with the execution Id that you want to use to load more.'),
                'type': 'error'
            });
            return;
        }
		
		if(loadingDialog)
			loadingDialog.render();

        var load_more_api = '/api/now/v1/multisource-analytics/registrations/' + executionId + '/all-executions';
        $j_glide.ajax(load_more_api, {
                method: "POST",
                headers: {
                    'X-UserToken': g_ck,
                }
            })
            .done(function informLoadMoreSuccess(response) {
				if(loadingDialog)
					loadingDialog.destroy();
			
                g_list.refresh();
            })
            .fail(function informLoadMoreError(jqXHR, textStatus, error) {
				if(loadingDialog)
					loadingDialog.destroy();
			
                g_GlideUI.addOutputMessage({
                    'msg': getMessage('Error Loading more. Please verify that the filter with the execution id is set and try again.'),
                    'type': 'error'
                });
            });
    }

}
