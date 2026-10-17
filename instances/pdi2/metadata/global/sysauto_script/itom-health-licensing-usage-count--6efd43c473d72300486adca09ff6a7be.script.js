var itomLicensingUtils = new sn_itom_license.ITOMLicensingUtils();
var newLicense = itomLicensingUtils.isNewLicenseModel();

if (newLicense) {
	gs.log("Running scheduled job ITOM Health Licensing Usage Count");
	var isOTOMPresent = itomLicensingUtils.isHealthPresent("otm");
	var hc = isOTOMPresent ? new ITOMHealthLicenseCounterWithOTOM() : new ITOMHealthLicenseCounter();
	hc.process();	
} else {
	new EvtMgmtLicenseCount().getNodesCount();
}
