if (current.operation() == 'insert')
	addCurrentAffectedCI();

if (current.operation() == 'update' && current.cmdb_ci.changes())
	addCurrentAffectedCI();

function addCurrentAffectedCI() {
	// Create current Service Offering Children from Affected CI record for this outage
	var spfConstants = new SPMFoundationConstants();
	var serviceHasChildOfferings = false;
	var gr = new GlideRecord(spfConstants.SERVICE_OFFERING_TABLE);
	gr.addQuery('parent', current.cmdb_ci);
	gr.query();
	while (gr.next()){
		serviceHasChildOfferings = true;

		var gr2 = new GlideRecord(spfConstants.CMDB_OUTAGE_CI_MTOM_TABLE);
		gr2.initialize();
		gr2.ci_item = gr.getUniqueValue();
		gr2.outage = current.sys_id;
		gr2.insert();
	}

	if (serviceHasChildOfferings)
		gs.addInfoMessage(gs.getMessage("Outage opened on {0} will affect the availability of its child offerings.", current.cmdb_ci.name));
	
}
