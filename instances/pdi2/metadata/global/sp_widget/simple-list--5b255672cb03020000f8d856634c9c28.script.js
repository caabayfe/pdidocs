(function () {
	data.filterMsg = gs.getMessage("Filter...");
	data.viewAllMsg = gs.getMessage("View all");
	if (gs.nil(options.hide_footer))
	    options.hide_footer = false;
	options.hide_footer = (options.hide_footer == "true" || options.hide_footer == true);
	options.table = $sp.getParameter('t') || options.table;
	if (!options.table)
		return;

	if(!new global.SPWidgetAccessControl().hasPublicAccess(options.table, $sp, options, input)){
		gs.warn("Deny access to table which is not public: " + options.table);
		data.isValid = false;
		return;
	}

	var gr = new GlideRecordSecure(options.table); // does ACL checking for us
	if (!gr.isValid()) {
		data.isValid = false;
		return;
	} else
		data.isValid = true;
	// grTemp is used to check isValidField since using GlideRecordSecure fails for date/time fields
	var grTemp = new GlideRecord(options.table);
	var enforceAclForEncodedQuery =  gs.getProperty('glide.service_portal.enable_acls_for_encoded_query_in_list' , 'true');
	if( enforceAclForEncodedQuery === 'true' || options.filter_acls == "true")
		gr = $sp.addQueryString(gr, options.filter);
	else
		gr.addEncodedQuery(options.filter);

	options.title = options.title || gr.getPlural();
	options.display_field = $sp.getParameter('f') || options.display_field;
	if (!options.display_field || !grTemp.isValidField(options.display_field))
		options.display_field = gr.getDisplayName();

	if (input && input.filterText)
		gr = $sp.addQueryString(gr, options.display_field + "LIKE" + input.filterText);

	options.title = options.title || gr.getPlural();
	options.secondary_fields = options.secondary_fields || "";
	options.secondary_fields = options.secondary_fields.split(",");
	if (!options.order_by || !grTemp.isValidField(options.order_by))
		options.order_by = options.display_field;

	// Set ID of sp_page from option schema
	if (options.list_page) {
		var sp_page = GlideRecord('sp_page');
		if (sp_page.get(options.list_page))
			options.list_page_dv = sp_page.getDisplayValue('id');
	}

	// redo query with limit
	if (options.order_direction == "asc")
		gr.orderBy(options.order_by);
	else
		gr.orderByDesc(options.order_by);

	data.maxCount = 500;
	gr.setLimit(data.maxCount);
	gr.enableSecurityFeature('data_filter');
	gr.query();

	data.actions = getActions();
	data.list = [];
	var recordIdx = 0;
	var listCount = 0;
	var rowCount = gr.getRowCount();
	var disableAclCheckForRowCount = gs.getProperty('glide.service_portal.disable_acl_check_for_row_count' , 'false');
	while (gr.next()) {
		listCount++;
		if (options.maximum_entries && recordIdx == options.maximum_entries) {
			if(disableAclCheckForRowCount == 'false')
				continue;
			else break;
		}

		var record = {};
		if (data.actions.length > 0) {
			var fields = gr.getFields();
			for (var i = 0; i < fields.size(); i++) {
				var glideElement = fields.get(i);
				var name = glideElement.getName();
				if (name.indexOf("sys_") == -1)
					record[name] = gr.getValue(name);
			}
		}

		record.sys_id = gr.getValue('sys_id');
		record.className = gr.getRecordClassName();
		if (options.image_field) {
			record.image_field = gr.getDisplayValue(options.image_field);
			if (!record.image_field)
				record.image_field = "noimage.pngx";
		}

		if (options.display_field)
			record.display_field = getField(gr, options.display_field);

		record.secondary_fields = [];
		options.secondary_fields.forEach(function(f) {
			record.secondary_fields.push(getField(gr, f));
		});

		if (options.sp_page) {
			var view = "sp";
			if (options.view) {
				var viewGR = new GlideRecord("sys_ui_view");
				viewGR.get(options.view);
				view = viewGR.getValue("name");
			}
			record.url = {id: options.sp_page, table: record.className, sys_id: record.sys_id, view: view};
		} else if (options.url != '')
			record.url = options.url;
		else
			record.url = null;

		data.list.push(record);
		recordIdx++;
	}

	data.count = disableAclCheckForRowCount == 'false' ? listCount : rowCount;
	data.showGM = rowCount >= 500; //showGM --> showGenericMessage

	function getField(gr, name) {
		var f = {};
		f.display_value = gr.getDisplayValue(name);
		f.value = gr.getValue(name);
		var ge = gr.getElement(name);
			if (ge == null)
				return f;

		f.type = ge.getED().getInternalType();
		if (f.type == "glide_date_time")
			f.isFuture = gs.dateDiff(gr.getValue(name), gs.nowNoTZ(), true) < 0;
		else if (f.type == "glide_date")
			f.isFuture = gs.dateDiff(gr.getValue(name), gs.now(), true) < 0;
		f.label = ge.getLabel();
		return f;
	}

	function getActions() {
		return JSON.parse($sp.getSPVlistActions($sp.getValue("sys_id")));
	}

})()
