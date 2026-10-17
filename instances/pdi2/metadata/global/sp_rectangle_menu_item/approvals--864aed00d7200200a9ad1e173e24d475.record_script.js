// only show 30 in header menu dropdown
var max = 30;

var t = data;
t.items = [];
t.count = 0;

// sp_rectangle_menu_item - Calculate once, reuse
var approvalUtil = new global.ApprovalDelegationUtil();
var u = approvalUtil.getAllMyRequestedApprovals();
var delegated = approvalUtil.getOnlyDelegatedApprovals();
var approvers = approvalUtil.getApprovers();

var filter = 'state=requested';
var requestedDelegatedApprovals = [];
if (delegated && delegated.length > 0) {
    var checkForRequested = new GlideRecord('sysapproval_approver');
    checkForRequested.addQuery('sys_id', delegated);
    checkForRequested.addQuery('state', 'requested');
    checkForRequested.query();
    while (checkForRequested.next()) {
        requestedDelegatedApprovals.push(checkForRequested.getValue('sys_id'));
    }
    if (requestedDelegatedApprovals.length > 0)
        filter += '^sys_idIN' + requestedDelegatedApprovals.toString();
}
if (approvers && approvers.length > 0) {
    if (requestedDelegatedApprovals.length > 0)
        filter += '^OR';
    else
        filter += '^';
    filter += 'approverIN' + approvers.toString();
}

t.record_watchers = [];
t.record_watchers.push({'table':'sysapproval_approver','filter':filter});

var z = new GlideRecord('sysapproval_approver');
z.addQuery("sys_id", u);
z.orderByDesc('sys_updated_on');
z.setLimit(max);
z.query();

var link = {};
link.title = gs.getMessage('View all approvals');
link.type = 'link';
link.href = '?id=approvals';
link.items = [];
t.items.push(link);

while (z.next()) {
  var a = {};
  var rec = getRecordBeingApproved(z);
	if (!rec.isValidRecord())  // nothing being approved - hmmm
		continue;
	
  a.short_description = rec.short_description + "";
  if (rec.getRecordClassName() == "sc_request") {
    var items = new GlideRecord("sc_req_item");
    items.addQuery("request", rec.getUniqueValue());
    items.query();
    if (items.getRowCount() > 1)
      a.short_description = items.getRowCount() + " requested items";
    else if (items.getRowCount() == 1) {
      items.next();
      a.short_description = items.getValue("short_description");
    }
  }
  $sp.getRecordValues(a, z, 'sys_id,sys_updated_on');
  a.number = rec.getDisplayValue();
  a.__table = z.getRecordClassName();
  a.type = 'approval';
  t.items.push(a);
  t.count++;
}

if (t.count == 1)
  data.badgeHint = gs.getMessage('{0} pending approval', [''+t.count]);
else
  data.badgeHint = gs.getMessage('{0} pending approvals', [''+t.count]);

function getRecordBeingApproved(gr) {
  if (!gr.sysapproval.nil())
    return gr.sysapproval.getRefRecord();

  return gr.document_id.getRefRecord();
}
