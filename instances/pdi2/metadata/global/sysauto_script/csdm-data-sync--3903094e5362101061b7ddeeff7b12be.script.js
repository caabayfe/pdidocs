var util = new CSDMCMDBUtil();

/******** Sync MBG from class to newly created CIs - Start ********/

// fetch all class info records with managed by group
var grCmdbClassInfo = new GlideRecord("cmdb_class_info");
var didUpdate;
grCmdbClassInfo.addNotNullQuery("managed_by_group");
grCmdbClassInfo.query();

while(grCmdbClassInfo.next()) {
	// apply MBG to CIs in each specific class created in last 25 hours
	var grCmdbCi = new GlideRecord("cmdb_ci");
	grCmdbCi.addEncodedQuery("sys_created_on>javascript:gs.hoursAgo(25)^managed_by_groupISEMPTY^sys_class_name=" + grCmdbClassInfo.getValue("class"));
	grCmdbCi.query();
	if (grCmdbCi.hasNext()) {
		grCmdbCi.setValue("managed_by_group", grCmdbClassInfo.getValue("managed_by_group"));
		grCmdbCi.updateMultiple();
		didUpdate = true;
	}
}
if (didUpdate) {
	gs.log("Completed updating new CIs with Managed By Group");
}
/******** Sync MBG from class to newly created CIs - End ********/

/******** Sync SG, CG, MBG from newly created ci relationship between TSO and DCG ********/
var oldValues = {'support_group':'','assignment_group':'','managed_by_group':''};
var grRel = new GlideRecord('cmdb_rel_ci');
grRel.addEncodedQuery('sys_created_on>javascript:gs.hoursAgo(25)');
grRel.addEncodedQuery('parent.sys_class_name=service_offering^child.sys_class_name=cmdb_ci_query_based_service');
grRel.query();
while(grRel.next()) {
	if(util.isTechnicalService(grRel.getValue('parent')) && util.isTechnicalService(grRel.getValue('child'))) {
		var tso = new GlideRecord('service_offering');
		if (!tso.get(grRel.getValue('parent')))
			continue;

		var newValues  = {};
		newValues.support_group = tso.getValue('support_group');
		newValues.assignment_group = tso.getValue('assignment_group');
		if (tso.getValue('managed_by_group')) {
			// prevents overriding CI class MBG value with blank
			newValues.managed_by_group = tso.getValue('managed_by_group');
		}
		gs.eventQueue('csdm.tso.modified', tso, JSON.stringify(oldValues), JSON.stringify(newValues), 'sn_csdm_tso_queue');
	}
}
/******** End - Sync SG, CG, MBG from newly created ci relationship between TSO and DCG ********/

/********* Sync values(SG,CG,MBG) for new CIs getting added to DCG - Start *********/
var grAssoc = new GlideRecord('svc_ci_assoc');
grAssoc.addEncodedQuery('service_id.sys_class_name=cmdb_ci_query_based_service^service_id.service_classification=Technical Service^sys_created_on>javascript:gs.hoursAgo(25)');
grAssoc.query();
var svcCiMap = {};
while(grAssoc.next()) {
	var cis = svcCiMap[grAssoc.getValue('service_id')];
	if(!cis)
		cis = [];
	cis.push(grAssoc.getValue('ci_id'));
	svcCiMap[grAssoc.getValue('service_id')] = cis;
}

// Check if DCG is connected to any TSO
var validDcgSysIds = [];
var map = util.getAssocTSOsFromDCG(Object.keys(svcCiMap));
Object.keys(map).forEach(function(v){
	validDcgSysIds = validDcgSysIds.concat(map[v]);
});

// Update values from DCG to CIs
var grDCG = new GlideRecord('cmdb_ci_query_based_service');

validDcgSysIds.forEach(function(dcgSysId) {
	grDCG.get(dcgSysId);
	var updateWithValues = {
		'support_group' : grDCG.getValue('support_group'),
		'assignment_group' : grDCG.getValue('assignment_group'),
	};
	// prevents overriding ci class manager value if blank
	if (grDCG.getValue('managed_by_group')) {
		updateWithValues['managed_by_group'] = grDCG.getValue('managed_by_group');
	}
	util.updateRecords('cmdb_ci', svcCiMap[dcgSysId], updateWithValues);
});

/********* Sync values(SG,CG,MBG) for new CIs getting added to DCG - End *********/
