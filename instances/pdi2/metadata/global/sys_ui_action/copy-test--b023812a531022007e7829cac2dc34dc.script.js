var cancelIt= function(){};

var copyIt= function(){
	// calls this script again
	gsftSubmit(null, g_form.getFormElement(), 'atf_copy_test');
};

function copyTestDialog(){

	var body = getMessage("atf_demo_data_message");

	if (g_form.getValue("sys_policy")==="read" && g_form.getValue("active")==="false"){
		var dialog = new GlideModal('glide_modal_confirm', true, 400);
		dialog.setTitle("Attention");
		dialog.setPreference("body", body);
		dialog.setPreference("buttonLabelCancel", getMessage("Cancel"));
		dialog.setPreference("buttonLabelComplete", getMessage("Ok"));
		dialog.setPreference('onPromptCancel', cancelIt.bind(this));
		dialog.setPreference('onPromptComplete', copyIt.bind(this));
		dialog.render();
	}else{
		copyIt();
	}
}


if (typeof window == 'undefined'){
	copyTest();
}

function copyTest() {
	var userTestProcessor = new sn_atf.UserTestProcessor();
	try {
		var copiedTestId = userTestProcessor.copyTest(current.sys_id);
		var uiNotification = new UINotification();
		uiNotification.setText(gs.getMessage("Successfully copied the test"));
		uiNotification.send();
		action.setRedirectURL("sys_atf_test.do?sys_id=" + copiedTestId);
	} catch(ex) {
		action.setRedirectURL(current);
		gs.addErrorMessage(gs.getMessage("Unexpected error occurred while copying the test: {0}", ex.message));
		}
	}
	
	
