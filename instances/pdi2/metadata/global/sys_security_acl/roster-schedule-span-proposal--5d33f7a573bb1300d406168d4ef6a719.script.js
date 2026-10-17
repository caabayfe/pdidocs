answer = false;
var loggedInUserId = gs.getUserID();
var approversList = new OCRosterSpanApprovalUtil().getPTOApproversList(current);
if (approversList.indexOf(loggedInUserId) > -1)
	answer = true;
if (!answer) {
	var ocSecurityNg = new OnCallSecurityNG();
	if (current.roster_schedule_span.group)
		answer = ocSecurityNg.rotaMgrAccess(current.roster_schedule_span.group + "");
}
