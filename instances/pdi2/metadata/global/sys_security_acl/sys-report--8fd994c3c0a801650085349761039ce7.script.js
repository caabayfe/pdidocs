var answer = false;
var myUserId = gs.getUserID();
var reportUserId = current.user.toString();
var isMe = (myUserId == current.created_by_user) || (myUserId == reportUserId);
var isGlobal = reportUserId == "GLOBAL";

if (isMe || gs.hasRole('report_admin'))
   answer = true;
else if (isGlobal)
   answer = gs.hasRole('report_global');
else if (isOneOfMyGroups())
   answer = gs.hasRole('report_group');

function isOneOfMyGroups() {
    if (reportUserId != "group")
        return false;

	var grpList = gs.getUser().getMyGroups();
    var myGrps = '';
    for (var i = 0; i != grpList.size(); i++) {
		if (i != 0) myGrps += ',';
        myGrps += grpList.get(i);
    }
	var gr = new GlideRecord('sys_report_users_groups');
	gr.addQuery('report_id', current.getUniqueValue());
	var qc = gr.addQuery('user_id', myUserId);
	if (myGrps != '')
        qc.addOrCondition('group_id', 'IN', myGrps);

	gr.query();
	if (gr.getRowCount() > 0)
		return true;

    return false;
}
