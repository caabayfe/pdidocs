function transform(input) {

    /**
     * STEP 1:
     * Fetch the font type theme assets ordered by name in asc order.
     */
    var themeAssetGr = new GlideRecord('sys_ux_theme_asset');
    themeAssetGr.addQuery('category', 'font');
    themeAssetGr.orderBy('name');
    themeAssetGr.query();

    /**
     * STEP 2:
     * Get the attachment records for table sys_ux_theme_asset with the filter on table_sys_id derived from step 1.
     * Store a mapping of table_sys_id -> file_name
	 * store a mapping of theme asset sys_id -> name
     */
    var attachmentGr = new GlideRecord('sys_attachment');
    attachmentGr.addQuery('table_name', 'sys_ux_theme_asset');
	var attachmentQuery;
	var themeAssetIdToNameMapping = {};
	while (themeAssetGr.next()) {
		var themeAssetId = themeAssetGr.getValue('sys_id');
        themeAssetIdToNameMapping[themeAssetId] = themeAssetGr.getValue('name');
        if (!attachmentQuery) {
            attachmentQuery = attachmentGr.addQuery('table_sys_id', themeAssetId);
        } else {
			attachmentQuery.addOrCondition('table_sys_id', themeAssetId);
		}
    }
    attachmentGr.query();

    var attachmentTableIdToNameMapping = {};
    while (attachmentGr.next()) {
        var themeAssetId = attachmentGr.getValue('table_sys_id');
		// Get the filename and remove the extension.
        attachmentTableIdToNameMapping[themeAssetId] = attachmentGr.getValue('file_name');
    }

    /**
     * Combine theme asset name and attachment file name.
     */
    var output = [];
    Object.keys(themeAssetIdToNameMapping).forEach(function(key) {
        output.push({
            sys_id: key,
            name: themeAssetIdToNameMapping[key] + ' ' + attachmentTableIdToNameMapping[key]
        });
    });

    return output;
}
