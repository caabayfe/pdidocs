_createCategories();

function _createCategories() {
	var UNCATEGORIZED_SYS_ID = 'c97d83137f4432005f58108c3ffa917a';

	// Get all tables
	var categoryMap = _getAllCategories();

	// Loop through all notifications that are missing a category
	var notifGR = new GlideRecord('sysevent_email_action');
	var conditions = notifGR.addQuery('category', '');
	conditions.addOrCondition('category', UNCATEGORIZED_SYS_ID);
	notifGR.query();
	while (notifGR.next()) {
		// OOB notifications should default to uncategorized (they'll get updated later in the upgrade process)
		if (!SncAppFiles.hasCustomerUpdate(notifGR))
			notifGR.setValue('category', UNCATEGORIZED_SYS_ID);
		else {
			// Use the table (collection... if specified) as the category
			var table = _getTable(notifGR);
			if (table) {
				var categorySysId = categoryMap[table];
				if (categorySysId)
					// Category already exists, use existing one
					notifGR.setValue('category', categorySysId);
				else {
					// Use table as name for new category to create
					var newCategory = new GlideRecord('sys_notification_category');
					newCategory.setValue('name', table);
					var sysId = newCategory.insert();

					notifGR.setValue('category', sysId);

					// Add this to the category map so we won't create it again
					categoryMap[table] = sysId;
				}
			} else
				// No table (collection), use uncategorized sys_id instead
				notifGR.setValue('category', UNCATEGORIZED_SYS_ID);
		}
		notifGR.setWorkflow(false);
		notifGR.update();
	}
}

function _getAllCategories() {
	// Iterate through all categories and store them in a map so we don't need
	// to run lots of queries during this script
	var categoryGR = new GlideRecord('sys_notification_category');
	categoryGR.query();
	var categoryMap = {};
	while (categoryGR.next()) {
		categoryMap[categoryGR.getValue('name')] = categoryGR.getUniqueValue();
	}

	return categoryMap;
}

function _getTable(notifGR) {
	var table = notifGR.getValue('collection');

	// Try to find the label of the table if possible
	var sysDbObjectGR = new GlideRecord('sys_db_object');
	if (table && sysDbObjectGR.get('name', table)) {
		var label = sysDbObjectGR.getValue('label');
		if (label)
			return label;
	}

	// Default to the table
	return table;
}
