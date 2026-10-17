if (pm.isZboot()) {
    	gs.info("No need to replace indexes for on par_dashboard_permission fields");
	} else {
		gs.info("Adding indexes");
		addIndexes();
	}

function addIndexes() {
    var table = 'par_dashboard_permission';
    var dbi = GlideDBConfiguration.getDBI(table);
    var dbindex = new GlideDBIndex(dbi);
    var td = GlideTableDescriptor.get(table);
    if (!td.isValid()) {
        gs.info("Invalid table descriptor on par_dashboard_permission");
    }

    var currentIndexes = td.getIndexDescriptors().values().toArray();
    var alreadyHasNewIndex = false;
    gs.info("Found " + currentIndexes.length + " indexes to process");
    for (var i = 0; i < currentIndexes.length; i++) {
    	var indexArrAsString = currentIndexes[i].getFields().toString()
        if (indexArrAsString == '[dashboard, group]' || indexArrAsString == '[dashboard, user]' || indexArrAsString == '[dashboard, role]') {
            if (dbindex.exists(currentIndexes[i])) {
                gs.info('Dropping dashboard permission index ' + currentIndexes[i].getFields().toString());
                dbindex.drop(currentIndexes[i]);
            }
        } else if (indexArrAsString == '[dashboard, role, group, user]') {
            alreadyHasNewIndex = true;
            gs.info('Found new dashboard permission index');
        }
    }
    if (!alreadyHasNewIndex) {
        gs.info('Creating new dashboard permission index');
        var newIdx = new GlideIndexDescriptor(table, 'idx_par_dash_combined_index', ['dashboard', 'role', 'group', 'user']);
        dbindex.create(table, [newIdx]);
    } else {
    	gs.info('Skipping index creation as it already exists');
    }
}
