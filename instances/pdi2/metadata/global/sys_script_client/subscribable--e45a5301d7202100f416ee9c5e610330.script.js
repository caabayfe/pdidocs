var gFormAlreadySubmitted = false;
function onSubmit() {

	if ( gFormAlreadySubmitted || (typeof g_form.getControl('subscribable') === "undefined"))
       return true;

	if( g_form.getControl('subscribable').changed && g_form.getValue('subscribable') == 'true' ) {

		var sysId;
		
		if (typeof rowSysId == 'undefined')
     		sysId = gel('sys_uniqueValue').value;
    	else
        	 sysId = rowSysId;
	
		var ga = new GlideAjax('SubscribedUserAjax');
		ga.addParam('sysparm_name','getSubscriptionCount');
		ga.addParam('sysparm_sys_id',sysId);
		ga.getXMLAnswer(GetNumberSubscribedParse);
		
		return false;
	}
	
	return true;
}

function GetNumberSubscribedParse(answer) {
   showMailScriptDialog(answer);
}

// answer holds the number of subscribers who are already subscribed to this notification
function showMailScriptDialog(answer) {
	if(answer < 2) {
		// If there were few subscribers, don't warn the user,
		// and push through the user's request
		confirm();
		return;
	}
	
    var dialog = new GlideDialogWindow('glide_confirm_standard');
    dialog.setTitle(new GwtMessage().getMessage('Subscribed User Warning'));
    dialog.setPreference('warning', true);
    dialog.setPreference('title', new GwtMessage().getMessage('You are making this notification subscribable. There are already '
											 + answer + " users subscribed to this notification."));
    dialog.setPreference('onPromptComplete',  confirm.bind(this));
    dialog.setPreference('onPromptCancel', cancel.bind(this));
    dialog.render(); 
}

function confirm() {
	gFormAlreadySubmitted = true;
    if(g_form.getActionName() == 'sysverb_update_and_stay')
        g_form.save();
    else
        g_form.submit();
}

function cancel() {
}
