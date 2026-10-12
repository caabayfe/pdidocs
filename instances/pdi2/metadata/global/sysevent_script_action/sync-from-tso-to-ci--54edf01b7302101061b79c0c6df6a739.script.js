(function processEvent() {

    var validKeys = ['assignment_group', 'support_group', 'managed_by_group'];
	var validKeysCheck = function (valuesToTest) {
		return valuesToTest.every(function (key) {
			return validKeys.indexOf(key) > -1;
		});
	};

    var oldValues = JSON.parse(event.parm1);
    var newValues = JSON.parse(event.parm2);

    if (JSUtil.nil(oldValues) || JSUtil.nil(newValues) || Object.keys(oldValues).length == 0 || Object.keys(newValues).length == 0)
        return;
		
	// check that oldValues and newValues have valid keys
	if (!validKeysCheck(Object.keys(oldValues)) || !validKeysCheck(Object.keys(newValues))) {
		gs.error("CSDM Data Sync payload did not pass valid keys check");
		return;
	}


    // Update 'Dynamic CI Group' records
    var util = new CSDMCMDBUtil();
    var dcg = util.getDynamicCIGroupsFromTSO(current.sys_id);
    if (JSUtil.nil(dcg))
        return;
	gs.log("Updating " + dcg.length + " 'Dynamic CI Group(s)' records.");
	util.updateRecords('cmdb_ci_query_based_service', dcg, newValues);

    // Update CI records belonging to 'Dynamic CI Group'
    var cis = util.getCIsFromDCG(dcg);
	if (Object.keys(cis).length == 0)
        return;
	if (oldValues.managed_by_group && !newValues.managed_by_group) {
		// explicitly update the managed by group field here and return if it's the only item in newValues
		util.revertMBGToClassValueOrNull(cis);
		delete newValues.managed_by_group;
		if (Object.keys(newValues).length == 0)
			return;
	}
	var cisToUpdate = [];
	Object.keys(cis).forEach(function (key) {
		cisToUpdate = cisToUpdate.concat(cis[key]);
	});
	if (cisToUpdate.length > 0) {
		gs.log("Updating " + cisToUpdate.length + " CI records belonging to some 'Dynamic CI Group(s)'.");
		util.updateRecords('cmdb_ci', cisToUpdate, newValues);
	}
})();
