var operation = current.operation();
var auditHelper = new SubscriptionAuditHelper();
var utils = new SNSubscriptionUtils();

var isPerUserLicense = (current.license_type == 0);
var isQuotaLicense = (current.license_type == 1);
var isDisplayOnly = (current.display_only == 1);
var allotmentType = getAllotmentType();

//Setting dashboard sysid to subscription overview dashboard for now 
//var PLATFORM_SUBCR_DASHBOARD_SYSID = "f13d4eb1f8512300964fbae098d152fc";
var PLATFORM_SUBCR_DASHBOARD_SYSID = "b9a45fa2eb022100b8f326115206fe78";

if (operation == "insert") {
	
	createCountConfigs();
	createPlatformLicCountConfigs();
	
	auditHelper.recordSubscriptionAdded(current);
	
} else if (operation == "update") {
	
	createPlatformLicCountConfigs();
	auditHelper.recordSubscriptionUpdated(current);
}

function createPlatformLicCountConfigs() {
	
	if (canCreatePlatformLicCfg()) {
		var license_count_cfg = new LicenseCountConfig(current.name, current.license_type, current.license_id);
		var allotedCountCfg = license_count_cfg.createCountCfg(license_count_cfg.TABLES_PURCHASED);
		var mappedCountCfg = license_count_cfg.createCountCfg(license_count_cfg.TABLES_USED);
		
		if (allotmentType == utils.PLAT_BUNDLE_ALLOT_TYPE) {
			var dashboardHelper = new LicenseDashboardHelper();
			var reportSysId = dashboardHelper.createPlatformLicReport(current, allotedCountCfg, mappedCountCfg);

			if (!JSUtil.nil(reportSysId))
				dashboardHelper.addReportToDashboard(PLATFORM_SUBCR_DASHBOARD_SYSID, reportSysId, current.name + " Custom Table Consumption");
		}
	}
}

function createCountConfigs() {
	
	if (canCreateCfg()) {
		var license_count_cfg = new LicenseCountConfig(current.name, current.license_type, current.license_id);
		
		var purchased_cfg = license_count_cfg.createCountCfg("purchased");
		var allocated_cfg = license_count_cfg.createCountCfg("allocated");
		
		var nonsubscribedusers_cfg = "";
		
		if (isPerUserLicense)		
			nonsubscribedusers_cfg = license_count_cfg.createCountCfg("Non-subscribed Users");
			
		// Create a report which displays the purchased and used trend for this license
		 if (addToDashboard(purchased_cfg, allocated_cfg, nonsubscribedusers_cfg)) {
			 var dashboadHelper = new LicenseDashboardHelper();
			 dashboadHelper.addToSubscriptionDashboard(current, purchased_cfg, allocated_cfg, nonsubscribedusers_cfg);
		 }

	} else 
		gs.log('Not creating count cfg for current license');
}

function canCreatePlatformLicCfg() {
	return (allotmentType == utils.PLAT_BUNDLE_ALLOT_TYPE || allotmentType == utils.GRANDFATHER_ALLOT_TYPE) && (!missingLicenseId());
}

function canCreateCfg() {
	// Create a count config entry for this license, if its of type 'per-user'/'capacity', display only is false
	// and license is identifiable through presence of license_id 
	return (!isDisplayOnly && (isPerUserLicense ||  isQuotaLicense)) && (!missingLicenseId());
}

function missingLicenseId() {
	return gs.nil(current.license_id);
}

function addToDashboard(purchased_cfg, allocated_cfg, nonsubscribedusers_cfg) {
	
	var canAddToDashboard = JSUtil.notNil(purchased_cfg) && JSUtil.notNil(allocated_cfg);
		
	if (canAddToDashboard && isPerUserLicense)
		canAddToDashboard = JSUtil.notNil(nonsubscribedusers_cfg);
	
	return canAddToDashboard;	
}

function getAllotmentType() {
	
	var allotGR = new GlideRecord(utils.LICENSE_CUST_ALLOTMENT_TBL);
	allotGR.addQuery(utils.SUBSCRIPTION, current.getUniqueValue());
	allotGR.query();
	
	if (allotGR.next())
		return allotGR.getValue(utils.ALLOTMENT_TYPE);
	
	return "-1";
}
