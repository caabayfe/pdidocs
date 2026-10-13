var NOTIFY_CONFERENCE_DIALOG_MSG = 'NOTIFY_CONFERENCE_DIALOG_MSG';
addLoadEvent(function() {
	if(taskParams.wb == 'true') {
		var ESC = 27;
		document.addEventListener('keyup', function(e) {
			if(e.keyCode == ESC) {
				window.NOW.CustomEvent.fireAll(NOTIFY_CONFERENCE_DIALOG_MSG, {cmd: 'cancel'});
			}
		});
	}
});

function continueOK() {
	disableOkDisplayLoading(endConferenceCallback);
}
function disableOkDisplayLoading(callBackFn) {
	document.getElementById("btn-conf-ok").classList.add('disabled');
	if(taskParams.wb != 'true')
		showLoadingDialog(endConferenceCallback);
	else {
		var el = document.getElementById('container');
		el.innerHTML = '<span class="icon-loading"> </span>';
		el.classList.add('container');
		endConferenceCallback();
	}
}

function endConferenceCallback() {
	var dialog = GlideModal.prototype.get('sn_comm_management_conference_call_end_comm_task');
	var conferenceCallID;
	if(!taskParams.conferenceCallID)
		conferenceCallID = dialog.getPreference('activeCallId');
	else
		conferenceCallID = taskParams.conferenceCallID;

	if (conferenceCallID) {
		var ga = new GlideAjax('global.NotifyOnTaskAjaxProcessor_V2');
		ga.addParam('sysparm_name', 'endConference');
		ga.addParam('sysparm_data', JSON.stringify({confId: conferenceCallID}));
		ga.getXML(callParse);
	} else {
		if(taskParams.wb != 'true')
			parent.document.location.reload();
	}
}

function callParse(response) {


		if(taskParams.wb == 'true')
			window.NOW.CustomEvent.fireAll(NOTIFY_CONFERENCE_DIALOG_MSG, {
				cmd: 'ok'
			});
		else {
			var dialog = GlideModal.prototype.get('sn_comm_management_conference_call_end_comm_task');
			hideLoadingDialog();
			dialog.destroy();
			if(!!parent)
				parent.document.location.reload();
			else
				document.location.reload();
		}
}

function continueCancel() {


	if(taskParams.wb == 'true')
		window.NOW.CustomEvent.fireAll(NOTIFY_CONFERENCE_DIALOG_MSG, {
			cmd: 'cancel'
		});
	else {
		var dialog = GlideModal.prototype.get('sn_comm_management_conference_call_end_comm_task');
		dialog.destroy();
	}

}
