/*global current, email, gs, GlideController, GlideRecord*/
/*eslint-disable eqeqeq*/
processApprovalEmail();

function processApprovalEmail() {
	"use strict";
	var errorMsg = "";
	var msgArray = [];

	if (current.getTableName() != "sysapproval_approver")
		return;

	var displayValue = getApprovalDisplayValue(current);

	if (!validUser()) {
		gs.log(getFailurePreamble() + "Sender email does not match approval assignee.");
		msgArray.push(displayValue);
		msgArray.push(current.approver.getDisplayValue());
		msgArray.push(current.approver.email);
		errorMsg = gs.getMessage("approvalInvalidUser", msgArray);
		createEmailEvent(errorMsg);
		return;
	}

	if (current.state == 'cancelled') {
		gs.log(getFailurePreamble() + "The approval has been canceled.");
		msgArray.push(displayValue);
		errorMsg = gs.getMessage("approvalCancelled", msgArray);
		createEmailEvent(errorMsg);
		return;
	}

	//Added for 'No Longer Required' approval state
	if (current.state == 'not_required') {
		gs.log(getFailurePreamble() + "The approval is no longer required.");
		msgArray.push(displayValue);
		errorMsg = gs.getMessage("approvalNotRequired", msgArray);
		createEmailEvent(errorMsg);
		return;
	}

	if (email.body.state != undefined)
		current.state = email.body.state;

	if (email.subject.indexOf("approve") >= 0)
		current.state = "approved";

	if (email.subject.indexOf("reject") >= 0)
		current.state = "rejected";

	if (current.state != "approved" && current.state != "rejected") {
		gs.log(getFailurePreamble() + "The subject is malformed. The approver probably did not click the approve or reject button on the email.");
		msgArray.push(displayValue);
		errorMsg = gs.getMessage("approvalFailed", msgArray);
		createEmailEvent(errorMsg);
		return;
	}

	current.comments = "reply from: " + email.from + "\n\n" + email.body_text;
	var controller = new GlideController();
	controller.putGlobal("approvalSource", "email");
	current.update();
	controller.removeGlobal("approvalSource");

	function validUser() {
		return new ApprovalDelegationUtil().isMyApproval(current);
	}

	function createEmailEvent(msg) {
		gs.eventQueue("approval.email.errorMsg", current, email.from, msg);
	}

	function getFailurePreamble() {
		return 'Approval email from ' + email.from + ' for task "' + displayValue + '" assigned to "' + current.approver.getDisplayValue()
				+ '" failed because: ';
	}

	function getApprovalDisplayValue(approval) {
		if (!gs.nil(approval.sysapproval))
			return approval.getDisplayValue();
		else {
			var target = new GlideRecord(approval.source_table);
			if (target.get(approval.document_id))
				return target.getDisplayValue();
		}
		gs.warn("Target for sysapproval_approver:" + approval.getUniqueValue() + " not found. Target=" + approval.source_table + ":" + approval.document_id);
		return "Unknown";
	}

}
