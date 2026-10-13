var company = parent.company;
if (JSUtil.notNil(company)) {
	var taskIds = [];

	var inc = "active=true^sys_created_on>javascript:gs.beginningOfLast3Months()^caller_id.company=" + company;
	var incGr = new GlideRecord('incident');
	incGr.addEncodedQuery(inc);
	incGr.setWorkflow(false);
	incGr.query();
	while (incGr.next())
		taskIds.push(incGr.getUniqueValue());

	var prb = "active=true^sys_created_on>javascript:gs.beginningOfLast3Months()^opened_by.company=" + company;
	var prbGr = new GlideRecord('problem');
	prbGr.addEncodedQuery(prb);
	prbGr.setWorkflow(false);
	prbGr.query();
	while (prbGr.next())
		taskIds.push(prbGr.getUniqueValue());

	var chg = "active=true^sys_created_on>javascript:gs.beginningOfLast3Months()^requested_by.company=" + company;
	var chgGr = new GlideRecord('change_request');
	chgGr.addEncodedQuery(chg);
	chgGr.setWorkflow(false);
	chgGr.query();
	while (chgGr.next())
		taskIds.push(chgGr.getUniqueValue());

	var scr = "active=true^sys_created_on>javascript:gs.beginningOfLast3Months()^requested_for.company=" + company;
	var reqGr = new GlideRecord('sc_request');
	reqGr.addEncodedQuery(scr);
	reqGr.setWorkflow(false);
	reqGr.query();
	while (reqGr.next())
		taskIds.push(reqGr.getUniqueValue());

	current.addEncodedQuery("sys_idIN" + taskIds.join(','));
	current.setWorkflow(false);
} else
	current.addEncodedQuery("sys_idISEMPTY");
