(function() {
	g_approval_form_request = true;
	var localInput = input; //to safeguard pullution of "input" via BR or other scripts

  if (localInput) {
		if (localInput.op == 'approved' || localInput.op == 'rejected') {
			var app = new GlideRecord("sysapproval_approver");
			if (app.get(localInput.target)) {
				var isMine = gs.hasRole("approval_admin") || (gs.hasRole("approver_user") && (new ApprovalDelegationUtil().isMyApproval(app)));
				if (!!isMine) {
					app.state = localInput.op;
					app.update();
				}
			}
		}
	}

	function getField(gr, name) {
			var f = {};
			var id = gr.getUniqueValue();
			gr = new GlideRecord(gr.getRecordClassName());
			gr.get(id);
			f.display_value = gr.getDisplayValue(name);
			f.value = gr.getValue(name);
			var ge = gr.getElement(name);
		  if (ge) {
				var ed = ge.getED();
				if (ed)
					f.type = ed.getInternalType();
				f.label = ge.getLabel();
			}
			return f;
	}

	function getMyRequestSysIds() {
		var ids = {};
		var rq_filter = new GlideRecord('request_filter');
		rq_filter.addActiveQuery();
		if (rq_filter.isValidField('applies_to'))
			rq_filter.addQuery('applies_to', 1).addOrCondition('applies_to', 10);
		rq_filter.query();
		while(rq_filter.next()) {
			var tableName = rq_filter.table_name;
			if (rq_filter.isValidField('table'))
				tableName = rq_filter.table;
			var gr = new GlideRecord(tableName);
			gr.enableSecurityFeature('data_filter');
			if (!gr.isValid())
				continue;
			
			gr.addQuery(rq_filter.filter);
			gr.query();
			while(gr.next()) {
				if(!gr.canRead()){
					continue;
				}
				var portalSettings = {};
				portalSettings.page = rq_filter.portal_page.nil()? '' : rq_filter.portal_page.getDisplayValue() + '';
				portalSettings.primary_display = rq_filter.primary_display.nil()? '': rq_filter.primary_display + '';
				portalSettings.secondary_displays = rq_filter.secondary_display.nil()? '': rq_filter.secondary_display + '';
				ids[gr.sys_id + ''] = portalSettings;
			}
		}
		return ids;
	}

	// retrieve the request's
	var myRequestMap = getMyRequestSysIds();
	var taskIDs = Object.keys(myRequestMap);
	var gr = new GlideRecordSecure('task');
	gr.addActiveQuery();
	gr.addQuery('sys_id', taskIDs);
	gr.orderByDesc('sys_created_on');
	gr.chooseWindow(0, 11);
	gr.query();

	data.request = {};

	data.request.req_list = [];
	var recordIdx = 0;

	while (gr.next()) {
		if (recordIdx == 10)
			break;
		var portalSettings = myRequestMap[gr.getUniqueValue()];
		if (typeof portalSettings == 'undefined')
			portalSettings = {};

		var record = {};
		record.sys_id = gr.getValue('sys_id');

		if (gr.getRecordClassName() == 'sc_request') {
				var ritm = new GlideRecord("sc_req_item");
				ritm.enableSecurityFeature('data_filter');
				if (!ritm.isValid())
					continue;
			
				ritm.addQuery("request", gr.getUniqueValue());
				ritm.query();
				if (ritm.getRowCount() == 0)
					continue;
				if (ritm.getRowCount() > 1)
					record.display_field = gs.getMessage("{0} requested items", ritm.getRowCount());
				else {
					ritm.next();
		        	if(!ritm.canRead()){
						continue;
					}
					record.display_field = ritm.cat_item.getDisplayValue() || ritm.getDisplayValue("short_description");
				}
				record.url = { id: portalSettings.page? portalSettings.page: 'sc_request', table: 'sc_request', sys_id: record.sys_id};
		} else {
				record.display_field = portalSettings.primary_display ? getField(gr, portalSettings.primary_display).display_value : getField(gr, 'number').display_value;
				record.url = { id: portalSettings.page? portalSettings.page :'ticket', table: gr.getRecordClassName(), sys_id: record.sys_id};
		}
		if (portalSettings.secondary_displays) {
			record.secondary_displays = [];
			portalSettings.secondary_displays.split(",").forEach(function (sDisplay){
				record.secondary_displays.push(getField(gr, sDisplay));
			});
		}
		else
			record.secondary_displays = getField(gr, 'short_description');

		record.task_number = getField(gr, 'number');
		record.updated_on = gr.getValue('sys_updated_on');
		data.request.req_list.push(record);
		recordIdx++;
	}

	if (recordIdx == 10 && gr.isValidRecord())
		data.request.maximum_entries = true;
	data.request.hasAny = data.request.req_list.length > 0 ? true : false;
	// fetch approvals for the user.
	data.approvals = {};
	data.showApprovals = gs.getUser().hasRole('approver_user');
	data.approvals.myApprovals = [];
	// Retreive approvals related to the User.
	if (data.showApprovals) {
	gr = new GlideRecordSecure('sysapproval_approver');
	gr.chooseWindow(0, 11);
	var qc1 = gr.addQuery("state", "requested");
	var sysid = new ApprovalDelegationUtil().getMyAndDelegatedApprovals();
	var approvers = new ApprovalDelegationUtil().getApprovers();
	gr.addQuery("sys_id", sysid).addOrCondition("approver", approvers);
	gr.orderBy("sys_created_on");
	gr.enableSecurityFeature('data_filter');
	gr.query();

	var approvals = [];
	var ids = [];

	while (gr.next()) {
		data.approvals.myApprovals.push(new String(gr.sys_id));
		if (approvals.length === 10) {
			data.approvals.show_viewAll = true;
			break;
		}
		var task = getRecordBeingApproved(gr);
		if (!task.isValidRecord())
			continue;

		ids.push(gr.getUniqueValue());
		var t = {};
		t.number = task.getDisplayValue();
		t.short_description = task.short_description.toString();
	  if (gr.getValue("approver") != gs.getUserID())
	   t.approver = gr.approver.getDisplayValue();
    if (task.isValidField("opened_by") && !task.opened_by.nil())
	   t.opened_by = task.opened_by.getDisplayValue();
	  // requestor >> opener
    if (task.isValidField("requested_by") && !task.requested_by.nil())
	   t.opened_by = task.requested_by.getDisplayValue();

    t.start_date = task.getDisplayValue('start_date');
    t.end_date = task.getDisplayValue('end_date');
    t.quantity = task.getDisplayValue('quantity');
    t.table = task.getLabel();
		if (task.getValue("price") > 0)
			t.price = task.getDisplayValue("price");

		if (task.getValue("recurring_price") > 0)
			t.recurring_price = task.getDisplayValue("recurring_price");

		t.recurring_frequency = task.getDisplayValue("recurring_frequency");

		var items = [];
		var idx = 0;
		var itemsGR = new GlideRecord("sc_req_item");
		if (!itemsGR.isValid())
			continue;
		
    itemsGR.addQuery("request", task.sys_id);
    itemsGR.query();
    if (itemsGR.getRowCount() > 1)
      t.short_description = itemsGR.getRowCount() + " requested items";

    while (itemsGR.next()) {
		if(!itemsGR.canRead()){
			continue;
		}
     var item = {};
     item.short_description = itemsGR.short_description.toString();
     if (itemsGR.getValue("price") > 0)
       item.price = itemsGR.getDisplayValue("price");
     if (itemsGR.getValue("recurring_price") > 0) {
      item.recurring_price = itemsGR.getDisplayValue("recurring_price");
      item.recurring_frequency = itemsGR.getDisplayValue("recurring_frequency");
     }
     if (itemsGR.getRowCount() == 1) {
      item.variables = new GlobalServiceCatalogUtil().getVariablesForTask(itemsGR, true);
      item.variableSummarizerWidget = $sp.getWidget('sc-variable-summarizer', {'variables' : item.variables, 'toggle' : false, 'task': t.number});
      t.short_description = itemsGR.short_description.toString();
     }

    items[idx] = item;
    idx++;
		}

		var j = {};
		j.sys_id = gr.getUniqueValue();
		j.table = gr.getRecordClassName();
		j.task = t;
		if (task) {
			j.variables = new GlobalServiceCatalogUtil().getVariablesForTask(task, true);
			j.variableSummarizerWidget = $sp.getWidget('sc-variable-summarizer', {'variables' : j.variables, 'toggle' : false, 'task': t.number});
		}

		j.items = items;
		j.state = gr.getValue("state");
		j.stateLabel = gr.state.getDisplayValue();
		approvals.push(j);
	}
	data.approvals.ids = ids;
	data.approvals.approval_list = approvals;

	data.approvals.hasAny = approvals.length > 0 ? true : false;
	}

	function getRecordBeingApproved(gr) {
		if (!gr.sysapproval.nil())
			return gr.sysapproval.getRefRecord();
		return gr.document_id.getRefRecord();
	}
	delete g_approval_form_request;
})();
