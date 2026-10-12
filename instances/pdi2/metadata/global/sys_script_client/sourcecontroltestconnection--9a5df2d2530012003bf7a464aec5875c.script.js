function onLoad() {} // define onLoad just to fufill the requirement
/*
 * The test connection logic is required by these UI actions on sys_repo_config form:
 * 1. submit 2. update 3. test connection
 * We define testConnection function using this client script so that it can be loaded
 * from other client-side scripts on sys_repo_config form.
 * The function also takes a variable 'action' in to handle different logic based on the
 * action type after running the test connection
 *
 * The function tests the remote repo URL with the provided user credentials. The process
 * of the test connection running at the back-end is as below:
 * 1. Clone the remote repo to make sure the URL is valid and the user has read access
 * 2. Create a scratch branch and try a dry-run push to the remote repo to make sure
 * the user has write access
 * 3. Wipe out the cloned local repo
 */
function testConnection(action) {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass("simple_progress_viewer", true, "40em", "10em");

	// used for highlight/flash problematic field(s)
	var HAS_ERROR_CSS_CLASS = 'has-error';
	var FORM_SUBMITTED_CSS_CLASS = 'form-submitted';
	var FORM_SYS_REPO_CONFIG_ID = 'sys_repo_config.do';
	var LABEL_FIELD_FLASH_COLOR = '#FFFACD'; // following the color style used in flash function of GlideForm.js

	var errorCode; // error code returned from server
	var errorMessage; // error message returned from server

	var url; //url field element
	var midServer;
	var credentialId;

	dd.on("beforeclose", function() {
		// restore to normal css state
		_removeHasErrorRelatedCssClasses();
		g_form.clearMessages();
		g_form.hideFieldMsg("url", true);

		if (errorCode == 1001 || errorCode == 1004) {
			g_form.flash('credential', LABEL_FIELD_FLASH_COLOR, 0);
			gel(FORM_SYS_REPO_CONFIG_ID).addClassName(FORM_SUBMITTED_CSS_CLASS);
			try {
				g_form.getElement('credential').addClassName(HAS_ERROR_CSS_CLASS);
			} catch (error) {
				// UI11, skip adding css classes
			}
			g_form.addErrorMessage(errorMessage, this);
			username.focus();
		}

		if (errorCode == 1003 || errorCode == 1005) {
			g_form.flash('url', LABEL_FIELD_FLASH_COLOR, 0); // following the color style used in flash function of GlideForm.js
			gel(FORM_SYS_REPO_CONFIG_ID).addClassName(FORM_SUBMITTED_CSS_CLASS);
			try {
				g_form.getElement('url').addClassName(HAS_ERROR_CSS_CLASS);
			} catch (error) {
				// UI11, skip adding css classes
			}
			g_form.showErrorBox("url", new GwtMessage().getMessage(errorMessage));
			url.focus();
		}
		//If successful and the 'action' variable is assigned which means the test
		//connection is called from either insert or update action, then proceed
		//the db action accordingly
		if (!errorCode || errorCode === '' || errorCode === '0') {
			g_form.addInfoMessage("Test connection succeeded");
			console.log("Action: " + action);
			if (action == "submit")
				gsftSubmit(null, g_form.getFormElement(), 'sysverb_insert');
			if (action == "update")
				gsftSubmit(null, g_form.getFormElement(), 'sysverb_update');
		}
	});

	var _removeHasErrorRelatedCssClasses = function() {
		gel(FORM_SYS_REPO_CONFIG_ID).removeClassName(FORM_SUBMITTED_CSS_CLASS);
		try {
			g_form.getElement('url').removeClassName(HAS_ERROR_CSS_CLASS);
		} catch (error) {
			// UI11, skip removing css classes
		}
	};

	var _getResultInfo = function(tracker_id) {
		var ga1 = new GlideAjax('SourceControlAjax');
		ga1.addParam('sysparm_name','getErrorCode');
		ga1.addParam('sysparm_progress_id', tracker_id);
		ga1.getXMLWait();
		errorCode = ga1.getAnswer();

		// for debugging
		console.log("Error code: " +  errorCode);

		var ga2 = new GlideAjax('SourceControlAjax');
		ga2.addParam('sysparm_name','getErrorMessage');
		ga2.addParam('sysparm_progress_id', tracker_id);
		ga2.getXMLWait();
		errorMessage = ga2.getAnswer();

		// for debugging
		console.log("Result message: " + errorMessage);
	};

	var map = new GwtMessage().getMessages(["Test Connection", "Test Connection", "Close", "Submit", "Update"]);
	dd.setTitle(map["Test Connection"]);

	url = g_form.getElement('url');
	midServer = g_form.getElement('mid_server');
	credentialId = g_form.getElement('credential');
	var sysAppId = g_form.getElement('sys_app').getValue();

	dd.setPreference('sysparm_ajax_processor_user_input_url', url.getValue().trim());
	if (midServer != null)
		dd.setPreference('sysparm_ajax_processor_mid_server_id', midServer.getValue());
	dd.setPreference('sysparm_ajax_processor_credential_id', credentialId.getValue());
	dd.setPreference('sysparm_ajax_processor_sys_repo_config_id', rowSysId);
	dd.setPreference('sysparm_ajax_processor_sys_app_id', sysAppId);

	dd.setPreference('sysparm_ajax_processor', 'SourceControlAjax');
	dd.setPreference('sysparm_ajax_processor_type','test_connection');

	dd.setPreference('sysparm_renderer_progress_title', map["Test Connection"]);
	dd.setPreference('sysparm_button_close', map["Close"]);

	dd.on("executionComplete", function(trackerObj) {
		_getResultInfo(trackerObj.sys_id);
		var closeBtn = $("sysparm_button_close");
		// when test connection succeeded, show different button text according to operation
		// to allow user to choose whether to proceed to the indicated action
		if (!errorCode || errorCode === '' || errorCode === '0') {
			if (action == "submit") // submit action
				closeBtn.innerHTML = map["Submit"];
			else if (action == "update") // update action
				closeBtn.innerHTML = map["Update"];
		}
		if (closeBtn) {
			closeBtn.onclick = function() {
				dd.destroy();
			};
		}
	});

	dd.setNologValue(true);
	dd.render();
}
