var ESCAPE = 27;
var $rejectBtn = $('mim_rejection_reason_ok_btn');
$rejectBtn.textContent = getMessage('Reject'); // TODO: this code to be removed, modal window to be re-written in plain html/js to make it consistant with promote and reject
function postRejectConfirm() {
	$("mim_rejection_reason_ok_btn").addClassName("disabled");
	var rejectionReason = $("mim_rejection_reason_text").value.trim();
	var ajaxHelper = new GlideAjax('sn_major_inc_mgmt.MIMListActionsUtil');
	ajaxHelper.addParam('sysparm_name', 'rejectMIC');
	ajaxHelper.addParam('sysparm_notes_value', rejectionReason);
	ajaxHelper.addParam('sysparm_sysids', $("selected_incidents").value);
	ajaxHelper.getXML(function(answer) {
		answer = answer.responseXML.getElementsByTagName("result");
		CustomEvent.fireAll('mi.rejectMIC.confirm', answer);
	});
}

addLoadEvent(function () {
	$("mim_rejection_reason_text").focus();
	$("mim_rejection_reason_ok_btn").writeAttribute('aria-disabled', true);
	document.on('keydown', function() {
		if(event && event.keyCode == ESCAPE)
			CustomEvent.fireAll('mi.rejectMIC.cancel');
	});
});
