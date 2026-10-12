(function(){
	/*  "use strict"; - linter issues */
	// populate the 'data' object
	var sp_page = $sp.getValue('sp_page');
	var pageGR = new GlideRecord('sp_page');
	pageGR.get(sp_page);
	data.page_id = pageGR.getValue("id");
	$sp.getValues(data);
	if (data.field_list) {
		data.fields_array = data.field_list.split(',');
	} else {
		data.field_list = $sp.getListColumns(data.table);
	}

	var currentInstanceOptions = JSON.stringify({
		table: data.table,
		filter: $sp.getValue("filter"),
		fieldList: data.field_list,
		maxEntries: $sp.getValue('maximum_entries'),
		orderBy: $sp.getValue('order_by'),
		orderDirection: $sp.getValue('order_direction')
	});

	var widgetInstanceId = $sp.getValue('sys_id') || 'default';
	var storageKey = 'sp.widget.instance.options.' + widgetInstanceId;

	var lastInstanceOptions = gs.getSession().getClientData(storageKey);
	data.instanceOptionsChanged = (lastInstanceOptions && lastInstanceOptions != currentInstanceOptions);

	if (!data.instanceOptionsChanged) {
		var urlP = $sp.getParameter('p');
		if (urlP)
			data.p = parseInt(urlP, 10);
	}

	gs.getSession().putClientData(storageKey, currentInstanceOptions);

	if (input) {
		data.p = input.p;
		data.o = input.o;
		data.d = input.d;
		data.q = input.q;
		// additional inputs for using a spModal
		data.table = input.table;
		data.filter = input.filter;
		data.view = input.view;
	}
	data.p = data.p || 1;
	data.o = data.o || $sp.getValue('order_by');
	data.d = data.d || $sp.getValue('order_direction');

	data.page_index = (data.p - 1);
	data.window_size = $sp.getValue('maximum_entries') || 10;
	data.window_start  = (data.page_index * data.window_size);
	data.window_end = (((data.page_index + 1) * data.window_size));
	// adding data.filter here so 
	// it can be picked up from an input.filter above
	data.filter = data.filter || $sp.getValue("filter");

	var gr = new GlideRecordSecure(data.table);
	if (!gr.isValid()) {
		data.invalid_table = true;
		data.table_label = data.table;
		return;
	}
	data.table_label = gr.getLabel();

	options.table = data.table;
	options.fields = data.field_list;
	options.o=data.o;
	options.d= data.d;
	options.filter=data.filter;
	options.window_size=data.window_size;
	options.view = data.view;
	options.useInstanceTitle = true; // to make sure Data Table widget uses headerTitle always
	options.headerTitle = options.title;
	options.show_breadcrumbs=true;
	options.p=data.p;
	
	data.dataTableWidget = $sp.getWidget('widget-data-table', options);
})();
