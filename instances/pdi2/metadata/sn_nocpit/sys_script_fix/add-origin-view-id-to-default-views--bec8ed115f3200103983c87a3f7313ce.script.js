function reassignUserDefaultViews() {
    var target = new GlideRecord('noc_user_view');

    //
    // get the global default view sys_id
    //
    target.addNullQuery('user_id');
    target.addQuery('view_name', '=', 'default');

    target.query();

    if (target.next()) {
        gs.log('Found ' + target.getRowCount() + ' global default views');
        var globalSysId = target.sys_id;

        gs.log('Default view sys_id = ' + globalSysId);

        //
        // Get all records of default views that contains a user id
        //
        target = new GlideRecord('noc_user_view');
        target.addNotNullQuery('user_id');
        target.addQuery('view_name', '=', 'default');
		target.addNullQuery('origin_view_id');

        target.query();
        gs.log('Updating ' + target.getRowCount() + ' user default views origin_view_id to ' + globalSysId);
        target.setValue('origin_view_id', globalSysId);
        target.updateMultiple();
    } else {
        gs.log('ERROR: Failed to find the global default user view!');
    }
}

reassignUserDefaultViews();
