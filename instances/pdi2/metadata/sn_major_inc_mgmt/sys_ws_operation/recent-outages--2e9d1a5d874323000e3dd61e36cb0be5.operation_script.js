(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	// This REST resource fetches all Outages related to either Affected CIs or Impacted Services of an Incident.
	// {source} - 'affected_cis' or 'impacted_services'

	var TABLES = {
		AFFECTED_CI: 'task_ci',
		INCIDENT: 'incident',
		IMPACTED_SERVICES: 'task_cmdb_ci_service',
		OUTAGE: 'cmdb_ci_outage',
		CMDB_OUTAGE_M2M: 'cmdb_outage_ci_mtom'
	};

	var sourceTableMap = {
		'affected_cis': TABLES.AFFECTED_CI,
		'impacted_services': TABLES.IMPACTED_SERVICES
	};

    // Validation of call
	var incidentSysId = request.pathParams.incidentSysId;
	if (!incidentSysId) 
		return new sn_ws_err.BadRequestError("Incident id not provided");

	var source = request.queryParams.source + '';
	if(!source)
		return new sn_ws.err.BadRequestError("Source is not provided");

	var incidentGr = new GlideRecord(TABLES.INCIDENT);
	if (!incidentGr.get(incidentSysId))
		return new sn_ws_err.NotFoundError("Requested Incident not found");

	
	var sourceField;
	if(sourceTableMap[source] === TABLES.AFFECTED_CI)
		sourceField = 'ci_item';
	if(sourceTableMap[source] === TABLES.IMPACTED_SERVICES)
		sourceField = 'cmdb_ci_service';

	var sourceGr = new GlideRecord(sourceTableMap[source]);
	sourceGr.addQuery('task', incidentSysId);
	sourceGr.query();

	var resultOutageArray = [];
	var cmdbCiQueryComponent = "";
	var relatedOutagesIdList = [];
	while (sourceGr.next()) {
		var configItemId = sourceGr.getValue(sourceField) + '';

		var cmdbOutageM2MGr = new GlideRecord(TABLES.CMDB_OUTAGE_M2M);
		cmdbOutageM2MGr.addQuery('ci_item', configItemId);
		cmdbOutageM2MGr.query();
		while (cmdbOutageM2MGr.next()) {
			relatedOutagesIdList.push(cmdbOutageM2MGr.getValue('outage') + '');
		}
		if (!sourceGr.hasNext())
			cmdbCiQueryComponent += "cmdb_ci=" + configItemId;
		else
			cmdbCiQueryComponent += "cmdb_ci=" + configItemId + "^OR";
	}

	var relatedOutagesQueryComponent = "";
	if (relatedOutagesIdList.length > 0)
		relatedOutagesQueryComponent = "^ORsys_idIN" + relatedOutagesIdList.join(',');
		
		
// Building timestamp query
	var lowerBoundProperty = 'cmdb.recent_outages.days_ago';
	var higherBoundProperty = 'cmdb.recent_outages.days_ahead';
	var lowerBoundDays = gs.getProperty(lowerBoundProperty, '7');
	var higherBoundDays = gs.getProperty(higherBoundProperty, '14');

	var timestampQueryComponent = 'endRELATIVEGE@dayofweek@ago@'+lowerBoundDays+'^ORendISEMPTY^beginRELATIVELE@dayofweek@ahead@'+higherBoundDays+'^';
	
	var filterQuery = timestampQueryComponent + cmdbCiQueryComponent + relatedOutagesQueryComponent;
	return filterQuery;

})(request, response);
