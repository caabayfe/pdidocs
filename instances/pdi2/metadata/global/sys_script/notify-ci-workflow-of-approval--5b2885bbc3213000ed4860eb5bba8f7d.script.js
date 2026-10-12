// Notify any workflow contexts that are associated with the CI on this change record:
var ci = current.cmdb_ci.getRefRecord();
if (ci.isValidRecord() && !gs.nil(ci.change)) {
	notifyRelatedContexts(ci);
}

// Notify any workflow contexts that are associated with a sc_req_item that is mapped to the CI on this change record:
var sc = new GlideRecord('sc_req_item');
sc.addQuery('configuration_item', current.cmdb_ci);
sc.addQuery('state', '1');   // 1 == 'open'
sc.query();
while (sc.next()) {
	notifyRelatedContexts(sc);
}

// Utility function to notify all contexts that are associated with the provided record "gr":
function notifyRelatedContexts(gr) {
	var context = new Workflow().getRunningFlows(gr, gr.sys_class_name);
	while (context.next()) {
		// Get our executing activity and send it a wakeup call
		var executing = new GlideRecord('wf_executing');
		executing.get('context', context.sys_id);
		var eventName = current.sys_id + 'chng';
		new Workflow().fireEventById(executing.sys_id, eventName);
	}
}
