(function executeRule(current, previous /*null when async*/) {
	gs.log('Validating operation on relation type ' + previous.name);

	var importantRelTypes = [
		'e7490a74532221007c949096a11c08b2', //Use End Point To::Use End Point From
		'45e94a74532221007c949096a11c0861', //Implement End Point To::Implement End Point From
		'85d98503ff100200d699ffffffffff8c', //Applicative Flow To::Applicative Flow From
		'a99d39118f10310091769012cbbe4429', //Cluster of::Cluster
		'60bc4e22c0a8010e01f074cbe6bd73c3', //Runs on::Runs
		'55c95bf6c0a8010e0118ec7056ebc54d', //Contains::Contained by
		'5599a965c0a8010e00da3b58b113d70e', //Connects to::Connected by
		'5f985e0ec0a8010e00a9714f2a172815'  //Hosted on::Hosts
	];

    // checking if current relation is an important relation
	if (-1 != importantRelTypes.indexOf(previous.sys_id+'')) {
		current.setAbortAction(true);
		gs.addInfoMessage(gs.getMessage('Relation type {0} is in use by application service and can not be modified/deleted.', previous.name));
	}
	
})(current, previous);
