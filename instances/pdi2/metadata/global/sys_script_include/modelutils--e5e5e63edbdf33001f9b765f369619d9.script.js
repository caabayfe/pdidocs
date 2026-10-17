var ModelUtils = Class.create();
ModelUtils.prototype = {
	initialize: function() {
	},

	type: 'ModelUtils'
};

ModelUtils.getCondition = function(model){
	var condition = model.manufacturer.changes() || model.name.changes() || model.version.changes() || model.edition.changes() || model.product.changes();
	var modelClass = model.sys_class_name.toString();
	if (model.sys_class_name.toString() === 'cmdb_software_product_model' &&  GlidePluginManager.isActive('com.snc.sams')) {
		condition = condition || model.platform.changes() || model.language.changes() || model.named_user_type.changes() ||
		model.database_option.changes() || model.condition_name.changes() || model.unit_of_consumption.changes();
	} else if (GlidePluginManager.isActive('sn_hamp') && sn_hamp.HAMConstants.MODEL_TYPES.indexOf(modelClass) > -1){
		condition = condition || model.normalized_model.changes();
	}
	return condition;
};

// Used in HAMPUtils and SAMPSWModelUtil
ModelUtils.generateDisplayName = function(values){
	var displayName = '';

	if (values[1].toLowerCase().indexOf(values[0].toLowerCase()) != -1 && 'true'.equals(gs.getProperty('glide.cmdb_model.display_name.shorten'))) {
		values[0] = '';
	}

	for (var i = 0; i < values.length; i++){
		if (values[i] != undefined && values[i] != '') {
			displayName += ' ' + values[i];
		}
	}
	return displayName.trim();
};

// Used in HAMPUtils
ModelUtils.calculateDefaultDisplayName = function(model){
	var values = [model.manufacturer.getDisplayValue(), model.name, model.version, model.edition];
	model.display_name = ModelUtils.generateDisplayName(values);
};

ModelUtils.setAbortAction = function(record, value) {
	record.setAbortAction(value);
};

ModelUtils.hasHAMAdminRole = function () {
	if (GlideDomainSupport.isDataSeparationEnabled()) {
		return (gs.hasRole('ham_admin') && gs.hasRole('domain_admin'));
	}

	return gs.hasRole('ham_admin');
};

ModelUtils.hasAssetAdminRole = function () {
	if (GlideDomainSupport.isDataSeparationEnabled()) {
		return (gs.hasRole('asset') && gs.hasRole('domain_admin'));
	}

	return gs.hasRole('asset');
};

// Used in EnterpriseContentServiceOptUtil
ModelUtils.hasEAMAdminRole = function () {
	if (GlideDomainSupport.isDataSeparationEnabled()) {
		return (gs.hasRole('sn_eam.enterprise_admin') && gs.hasRole('domain_admin'));
	}
	return gs.hasRole('sn_eam.enterprise_admin');
};

ModelUtils.calculateDisplayName = function(model){
	var modelClass = model.sys_class_name.toString();
	if (modelClass === 'cmdb_software_product_model' && GlidePluginManager.isActive('com.snc.sams')) {
		new SAMPSWModelUtil().calculateSoftwareModelDisplayName(model);
	} else if (GlidePluginManager.isActive('sn_hamp') && sn_hamp.HAMConstants.MODEL_TYPES.indexOf(modelClass) > -1){
		sn_hamp.HAMUtils.calculateModelDisplayName(model);
	} else if (modelClass === 'cmdb_software_component_model' && GlidePluginManager.isActive('sn_itam_samp')) {
		sn_itam_samp.SamComponentModelGenerator.calculateComponentModelDisplayName(model);
	} else {
		global.ModelUtils.calculateDefaultDisplayName(model);
	}
};
ModelUtils.isAncestor = function (gr, ancestorTableName) {
	if (!gs.nil(gr)) {
		return gr.instanceOf(ancestorTableName);
	}
	return false;
};
ModelUtils.disableBR = function (gr) {
	ModelUtils.validateAccessToDisableBR(gr);
	gr.setWorkflow(false);
};
ModelUtils.insertDisableBR = function (gr) {
	ModelUtils.validateAccessToDisableBR(gr);
	gr.setWorkflow(false);
	return gr.insert();
};
ModelUtils.updateDisableBR = function (gr) {
	ModelUtils.validateAccessToDisableBR(gr);
	gr.setWorkflow(false);
	return gr.update();
};
ModelUtils.updateEnableBR = function (gr) {
	gr.setWorkflow(true);
	return gr.update();
};
ModelUtils.updateMultipleDisableBR = function (gr) {
	ModelUtils.validateAccessToDisableBR(gr);
	gr.setWorkflow(false);
	return gr.updateMultiple();
};
ModelUtils.deleteMultipleDisableBR = function (gr) {
	ModelUtils.validateAccessToDisableBR(gr);
	gr.setWorkflow(false);
	return gr.deleteMultiple();
};
ModelUtils.isDomainSeparationEnabled = function() {
	return GlideDomainSupport.isDataSeparationEnabled();
};
ModelUtils.getStopWatch = function () {
	return new GlideStopWatch();
};
ModelUtils.getStopWatchTime = function (stopWatch) {
	if (stopWatch instanceof GlideStopWatch) {
		return stopWatch.toString();
	} else {
		return '';
	}
};
ModelUtils.canReadIntProfile = function () {
	var hasAccess = false;
	hasAccess = gs.hasRole('asset') || gs.hasRole('inventory_admin') || ModelUtils.isAdminOrDomainAdminUser();

	return hasAccess;
};
ModelUtils.canWriteIntProfile = function () {
	return ModelUtils.isAdminOrDomainAdminUser();
};
ModelUtils.isAdminOrDomainAdminUser = function() {
    // Following will always return true for Admin
    return gs.hasRole('domain_admin');
};
ModelUtils.validateAccessToDisableBR = function (gr) {
	if (!ITAMScopeTableAccess.checkTableAccess(gr)) {
		gs.error(gs.getMessage('Workflow on this table {0} cannot be disabled', gr.getTableName()));
		gr.setAbortAction(true);
	}
};
ModelUtils.globalGlideRunScriptJob = function (script) {
	if (!gs.nil(script)) {
		GlideRunScriptJob.scheduleScript(script);
	}
};
ModelUtils.evalScript = function(gr, script) {
	var x = eval(script);
	return x;
};
ModelUtils.isSelfHostedInstance = function(){
	return GlideUtil.isSelfHostedInstance();
};
//Used in Tableau Spoke - Tableau Configuration template's OnCreate script
//Updating password2 field, which requires encryption via GlideRecord
ModelUtils.setSigningKey = function(jwtKeystoreAliasesObj, signingValue) {
	var signingKeyValue = new GlideRecord('jwt_keystore_aliases');
	signingKeyValue.get(jwtKeystoreAliasesObj.sys_id);
	signingKeyValue.setDisplayValue('signing_key_password', signingValue);
	signingKeyValue.update();
};
//Used in Tableau Spoke - Tableau Configuration template's OnCreate script
//Updating multiple records of JWT Claim Validation table based on name via JSON
ModelUtils.setJWTClaimValue = function(jwtProviderSysID, jwtClaimValidation) {
	var claimValidationGR = new GlideRecord('jwt_claim_validation');
	claimValidationGR.addQuery('jwt_provider', jwtProviderSysID);
	claimValidationGR.query();
	while (claimValidationGR.next()) {
		claimValidationGR.claim_value = jwtClaimValidation[claimValidationGR.getValue('name')];
		claimValidationGR.update();
	}
};
ModelUtils.checkIfJobTriggerPresent = function (jobName, documentKey, scriptSearchString) {
	var isJobAlreadyPresent = false;
	var triggerGQ = new global.GlideQuery('sys_trigger')
						.where('state', 'IN', [0, 1, 2]);
	if (!gs.nil(jobName)) {
		triggerGQ = triggerGQ.where('name', 'LIKE', jobName);
	}
	if (!gs.nil(documentKey)) {
		triggerGQ = triggerGQ.where('document_key', documentKey);
	}
	if (!gs.nil(scriptSearchString)) {
		triggerGQ = triggerGQ.where('script', 'LIKE', scriptSearchString);
	}						
	isJobAlreadyPresent = triggerGQ.selectOne().isPresent();
	return isJobAlreadyPresent;
};
ModelUtils.submitJobwithDupCheck = function (nameSearchKey, jobName, script, modelCatId) {
	var assetMgmBaseJob = new global.AssetManagementBaseJob();
	var currentDomainId = '';
	if (assetMgmBaseJob.fIsDomainDataSeparationEnabled) {
		currentDomainId = assetMgmBaseJob.getCurrentDomainSysId();
	}
	var isJobAlreadyPresent = global.ModelUtils.checkIfJobTriggerPresent(nameSearchKey, modelCatId, currentDomainId);
	if (!isJobAlreadyPresent) {
		assetMgmBaseJob.runScriptByJob(script, new GlideDateTime(), jobName, '', modelCatId);
	}
	return isJobAlreadyPresent;
};

ModelUtils.setSessionDomain = function (domainId) {
	GlideSession.get().setDomainID(domainId);
};
