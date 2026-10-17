function submitTag() {
	//Get tag name, if name is not found, don't proceed
	var tagName = g_form.getValue('name');
	if (!tagName || tagName === null || tagName === '') {
		//let form deal with error message
		gsftSubmit(null, g_form.getFormElement(), 'sysverb_insert');
		return;
	}
	
	//Get repo config id, if id is not found, don't proceed
	var repoConfigId = g_form.getValue('sys_repo_config');
	if (!repoConfigId || repoConfigId === null || repoConfigId === '') {
		//let form deal with error message
		gsftSubmit(null, g_form.getFormElement(), 'sysverb_insert');
		return;
	}
	
	var trackerId; // will be returned from the server
	
	var error_code; // error code returned from server
	var _getErrorCode = function(tracker_id) {
		var ga1 = new GlideAjax('SourceControlAjax');
		ga1.addParam('sysparm_name','getErrorCode');
		ga1.addParam('sysparm_progress_id', tracker_id);
		ga1.getXMLWait();
		error_code = ga1.getAnswer();
	};
	
	var repoTagObjectId; // will be returned in the tracker
	var _getRepoTagObjectId = function(tracker_id) {
		var ga1 = new GlideAjax('SourceControlAjax');
        ga1.addParam('sysparm_name','getValueFromResult');
        ga1.addParam('sysparm_progress_id', tracker_id);
        ga1.addParam('sysparm_parameter_name', 'sys_repo_tag.object_id');
		ga1.getXMLWait();
		repoTagObjectId = ga1.getAnswer();
	};	
	
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass("simple_progress_viewer", true, "40em", "10em");
	dd.on("beforeclose", function() {
		//If successful, then submit the form to create the tag in db
		if (!error_code || error_code === '' || error_code === '0'){
			//turn off the dirty form check
			window.g_form.modified = false;
			var returnUrl = g_form.getValue('sysparm_referring_url');
			if(!returnUrl) 
				returnUrl = 'sys_repo_config.do?sys_id=' + repoConfigId;
			else
				returnUrl = printListURLDecode(returnUrl);
		
			window.location.replace(returnUrl);
		}
	});

	var map = new GwtMessage().getMessages(["Create Tag", "Close"]);
	dd.setTitle(map["Create Tag"]);
	
	dd.setPreference('sysparm_ajax_processor', 'SourceControlAjax');
	dd.setPreference('sysparm_ajax_processor_type','create_tag');
	dd.setPreference('sysparm_ajax_processor_sys_repo_config_id', repoConfigId);
	dd.setPreference('sysparm_ajax_processor_tag_name', tagName);
	dd.setPreference('sysparm_ajax_processor_skip_insert_for_form', true);

	dd.setPreference('sysparm_renderer_progress_title', map["Create Tag"]);
	dd.setPreference('sysparm_button_close', map["Close"]);

	dd.on("executionComplete", function(trackerObj) {
		trackerId = trackerObj.sys_id;
		_getErrorCode(trackerId);
		var closeBtn = $("sysparm_button_close");
		if (closeBtn) {
			closeBtn.onclick = function() {
				dd.destroy();
			};
		}
	});

	dd.render();
}

function printListURLDecode(href) {
	href = href.replace(/@99@/g, "&");
	href = href.replace(/@88@/g, "@99@");
	href = href.replace(/@77@/g, "@88@");
	href = href.replace(/@66@/g, "@77@");
	return href;	
}
