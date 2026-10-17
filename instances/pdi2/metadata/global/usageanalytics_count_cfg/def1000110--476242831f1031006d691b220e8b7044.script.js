answer = getAutomatedCatItems();


// 1. find all catalog items that are assigned workflows
function getAutomatedCatItems() {
	if (!GlideTableDescriptor.isValid('sc_cat_item'))
		return;
	
	var gr = new GlideRecord("sc_cat_item");
	gr.addNotNullQuery("workflow");
	gr.query();
	
	// create a collection of versions
	var versions = [];
	
	while (gr.next()) {
		var version = getVersionId(gr.workflow);
		if (JSUtil.nil(version))
			continue;
		
		// see if workflow ask for user interaction
		var humanInteractionCount =  wfHasHumanInteraction();
		if (JSUtil.nil(version))
			continue;
		
		// collect info in obj
		var itemStatus = {};
		itemStatus.workflow = gr.workflow + '';
		itemStatus.name = gr.name + '';
		itemStatus.version = version;
		itemStatus.humanInteractionCount = humanInteractionCount;	
		versions.push(itemStatus);
	}
	
	return versions.length;
}

// 2. for each workflow get the latest version, published version
function getVersionId(workflowID) {
	if (!GlideTableDescriptor.isValid('wf_workflow_version'))
		return '';
	
	var versionGR = new GlideRecord('wf_workflow_version');
	versionGR.addQuery('published', true);
	versionGR.addQuery('workflow', workflowID);
	versionGR.query();
	
	if (versionGR.next())
		return versionGR.sys_id;
}

// 3. see if there are any tasks or approvals - if so it needs humans
//group approval
function wfHasHumanInteraction(versionId) {
	if (!GlideTableDescriptor.isValid('wf_activity'))
		return '';
	
	//enumerate activities that require humans
	var activityList = '354e911f0a0a029a00e6a0e6ad74206f,'+  //group approval
	'35433da80a0a029a0028c639a1e51eb,' + //approval user
	'283e8bb80a2581021d036a052ffc3433,' + //approval coordinator
	'533e39330a6a803f54a9619525b0a7e7,' + //manual approval
	'38891b6f0a0a0b1e00efdfdd77602027,'+ // catalog task
	'9f4d1be5c0a8016400043d34ce066316'; // create task
	
	var grActivity = new GlideRecord('wf_activity');
	grActivity.addQuery('activity_definition', 'IN', activityList);
	grActivity.addQuery('workflow_version', versionId);
	grActivity.query();
	
	return grActivity.getRowCount();
	
}
