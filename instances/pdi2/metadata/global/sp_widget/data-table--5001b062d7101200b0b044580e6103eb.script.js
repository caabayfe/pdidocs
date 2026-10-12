(function() {
	if (!input) // asynch load list
		return;

	data.msg = {};
	data.msg.sortingByAsc = gs.getMessage("Sorted in ascending order");
	data.msg.sortingByDesc = gs.getMessage("Sorted in descending order");
	data.searchMsg = gs.getMessage("Search");

	/*
	 * data.table = the table
	 * data.p = the current page starting at 1
	 * data.o = the order by column
	 * data.d = the order by direction
	 * data.keywords = the keyword search term
	 * data.list = the table data as an array
	 * data.invalid_table = true if table is invalid or if data was not succesfully fetched
	 * data.table_label = the table's display name. e.g. Incident
	 * data.table_plural = the table's plural display name. e.g. Incidents
	 * data.fields = a comma delimited list of field names to show in the data table
	 * data.column_labels = a map of field name -> display name
	 * data.window_size = the number of rows to show
	 * data.filter = the encoded query
	 */
	// copy to data[name] from input[name] || option[name]
	optCopy(['table', 'p', 'o', 'd', 'filter', 'fixed_query', 'filterACLs', 'fields', 'keywords', 'view']);
	optCopy(['relationship_id', 'apply_to', 'apply_to_sys_id', 'window_size']);
	if (!data.table) {
		data.invalid_table = true;
		data.table_label = "";
		return;
	}

	if (!data.fields) {
		if (data.view)
			data.fields = $sp.getListColumns(data.table, data.view);
		else
			data.fields = $sp.getListColumns(data.table);
	}

	data.view = data.view || 'mobile';
	data.table = data.table || $sp.getValue('table');
	data.filter = data.filter || $sp.getValue('filter');
	data.keywords = data.keywords || $sp.getValue('keywords');
	data.p = data.p || $sp.getValue('p') || 1;
	data.p = parseInt(data.p);
	data.o = data.o || $sp.getValue('o') || $sp.getValue('order_by');
	data.d = data.d || $sp.getValue('d') || $sp.getValue('order_direction') || 'asc';
	data.useTinyUrl = gs.getProperty('glide.use_tiny_urls') === 'true';
	data.tinyUrlMinLength = gs.getProperty('glide.tiny_url_min_length');

	var grForMetaData = new GlideRecord(data.table);

	if (input.setOrderUserPreferences) {
		// update User Preferences on a manual sort for UI consistency
		gs.getUser().savePreference(data.table + ".db.order", data.o);
		gs.getUser().savePreference(data.table + ".db.order.direction", data.d == "asc" ? "" : "DESC");
		data.setOrderUserPreferences = false;
	}
	// if no sort specified, find a default column for UI consistency
	if (!data.o)
		getOrderColumn();
	
	data.page_index = data.p - 1;
	data.show_new = data.show_new || options.show_new;
	var windowSize = data.window_size || $sp.getValue('maximum_entries') || 20;
	windowSize = parseInt(windowSize);
	if (isNaN(windowSize) || windowSize < 1)
		windowSize = 20;
	data.window_size = windowSize;

	var gr;
	// FilteredGlideRecord is not supported in scoped apps, so GlideRecordSecure will always be used in an application scope
	if (typeof FilteredGlideRecord != "undefined" && (gs.getProperty("glide.security.ui.filter") == "true" || grForMetaData.getAttribute("glide.security.ui.filter") != null)) {
		gr = new FilteredGlideRecord(data.table);
		gr.applyRowSecurity();
	} else
		gr = new GlideRecordSecure(data.table);
	if (!gr.isValid()) {
		data.invalid_table = true;
		data.table_label = data.table;
		return;
	}

	data.canCreate = gr.canCreate();
	data.newButtonUnsupported = data.table == "sys_attachment";
	data.table_label = gr.getLabel();
	data.table_plural = gr.getPlural();
	data.title = input.useInstanceTitle && input.headerTitle ? gs.getMessage(input.headerTitle) : data.table_plural;
	data.hasTextIndex = $sp.hasTextIndex(data.table);
	
	var enforceQueryAclForDataTable = gs.getProperty("glide.security.query_acl.enabled.data_table", "true");
	if (data.filter) {
	    if (shouldEnforceACLForDataTable(enforceQueryAclForDataTable) || data.filterACLs)
		    gr = $sp.addQueryString(gr, data.filter);
        else
            gr.addEncodedQuery(data.filter);
    }
	
	function shouldEnforceACLForDataTable(property) {
		if (!property)
			return false;
		if (property == 'true')
			return true;
		else
			return "external_and_guests".equals(property) && (!gs.isLoggedIn() || gs.hasRole('snc_external'));
	}
	
	if (data.keywords) {
		gr.addQuery('123TEXTQUERY321', data.keywords);
		data.keywords = null;
	}

	data.filter = gr.getEncodedQuery();

	if(!gs.nil(data.fixed_query)){
		gr = $sp.addQueryString(gr, data.fixed_query);
	}

	if (data.relationship_id) {
		var rel = GlideRelationship.get(data.relationship_id);
		var target = new GlideRecord(data.table);
		var applyTo = new GlideRecord(data.apply_to);
		applyTo.get("sys_id", data.apply_to_sys_id);
		rel.queryWith(applyTo, target); // put the relationship query into target
		data.exportQuery = target.getEncodedQuery();
		gr = $sp.addQueryString(gr, data.exportQuery); // get the query the relationship made for us
	}
	if (data.exportQuery)
		data.exportQuery += '^' + data.filter;
	else
		data.exportQuery = data.filter;
	data.exportQueryEncoded = encodeURIComponent(data.exportQuery + (!gs.nil(data.fixed_query) ? ('^' + data.fixed_query) : ''));
	if (data.o){
		if (data.d == "asc")
			gr.orderBy(data.o);
		else
			gr.orderByDesc(data.o);
		if (gs.getProperty("glide.secondary.query.sysid") == "true")
			gr.orderBy("sys_id");
	}

	data.window_start = data.page_index * data.window_size;
	data.window_end = (data.page_index + 1) * data.window_size;
	gr.chooseWindow(data.window_start, data.window_end);
	gr.setCategory("service_portal_list");
	gr._query();

	data.row_count = gr.getRowCount();
	data.num_pages = Math.ceil(data.row_count / data.window_size);
	data.column_labels = {};
	data.column_types = {};
	data.fields_array = data.fields.split(',');

	// use GlideRecord to get field labels vs. GlideRecordSecure
	for (var i in data.fields_array) {
		var field = data.fields_array[i];
		var ge = grForMetaData.getElement(field);
		if (ge == null)
			continue;

		/**
		 * Check if the given fiels is a dot walked field.
		 * If it is a dot walked field, we should use the getDisplayLabel() of
		 * the CompositeElement which will internally check for the "long_label"
		 * or "short_label" dictionary attribute and returns the label value accordingly.
		 */
		var compositeElement = new GlideCompositeElement(field, data.table);
		if(!compositeElement.isSimple()) {
			data.column_labels[field] = compositeElement.getDisplayLabel();
		} else {
			data.column_labels[field] = ge.getLabel();
		}
		data.column_types[field] = ge.getED().getInternalType();
	}

	data.list = [];
	while (gr._next()) {
		var record = {};
		$sp.getRecordElements(record, gr, data.fields);
		if (typeof FilteredGlideRecord != "undefined" && gr instanceof FilteredGlideRecord) {
			// FilteredGlideRecord doesn't do field-level
			// security, so take care of that here
			for (var f in data.fields_array) {
				var fld = data.fields_array[f];
				if (!gr.isValidField(fld))
					continue;

				if (!gr[fld].canRead()) {
					record[fld].value = null;
					record[fld].display_value = null;
				}
			}
		}
		record.sys_id = gr.getValue('sys_id');
		record.targetTable = gr.getRecordClassName();
		data.list.push(record);
	}

	data.enable_filter = (input.enable_filter == true || input.enable_filter == "true" ||
		options.enable_filter == true || options.enable_filter == "true");
	var breadcrumbWidgetParams = {
		table: data.table,
		query: data.filter,
		enable_filter: data.enable_filter
	};
	data.filterBreadcrumbs = $sp.getWidget('widget-filter-breadcrumbs', breadcrumbWidgetParams);

	// copy to data from input or options
	function optCopy(names) {
		names.forEach(function(name) {
			data[name] = input[name] || options[name];
		})
	}

	// getOrderColumn logic mirrors that of Desktop UI when no sort column is specified
	function getOrderColumn() {
		// First check for user preference
		var pref = gs.getUser().getPreference(data.table + ".db.order");
		if (!GlideStringUtil.nil(pref)) {
			data.o = pref;
			if (gs.getUser().getPreference(data.table + ".db.order.direction") == "DESC")
				data.d = 'desc';
			return;
		}

		// If no user pref, check for table default using same logic as Desktop UI:
		// 1) if task, use number
		// 2) if any field has isOrder attribute, use that
		// 3) use order, number, name column if exists (in that priority)
		if (grForMetaData.isValidField("sys_id") && grForMetaData.getElement("sys_id").getED().getFirstTableName() == "task") {
			data.o = "number";
			return;
		}
		
		// Next check for isOrder attribute on any column
		var elements = grForMetaData.getElements();
		// Global and scoped GlideRecord.getElements return two different things,
		// so convert to Array if needed before looping through
		if (typeof elements.size != "undefined") {
			var elementArr = [];
			for (var i = 0; i < elements.size(); i++)
				elementArr.push(elements.get(i));
			elements = elementArr;
		}
		// Now we can loop through
		for (var j = 0; elements.length > j; j++) {
			var element = elements[j];
			if (element.getAttribute("isOrder") == "true") {
				data.o = element.getName();
				return;
			}
		}
		// As last resort, sort on Order, Number, or Name column
		if (grForMetaData.isValidField("order"))
			data.o = "order";
		else if (grForMetaData.isValidField("number"))
			data.o = "number";
		else if (grForMetaData.isValidField("name"))
			data.o = "name";
	}
	
})();
