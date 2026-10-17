(function() {
    if (options.title)
        options.title = gs.getMessage('{0}', options.title);
    else
        options.title = gs.getMessage('Announcements');
	options.max_records = options.max_records ? options.max_records : 20;
	options.paginate = options.paginate === 'true' && options.max_records;
	options.use_display_style = options.use_display_style === 'true';
	data.rowsMessage = gs.getMessage('Rows {0} - {1} of {2}');

	if (options.view_all_page) {
		var gr = $sp.getPageRecord(options.view_all_page, null);
		options.view_all_page = gr.getValue('id');
	}

	if (options.type) {
		var types = [];
		var typeIds = options.type.split(',');
		var typesMap = $sp.getAnnouncementConsumerType(typeIds);

		typeIds.forEach(function(typeId){
		 types.push(typesMap.get(typeId));
		});

		options.type = types.join(',');
	}
})();
