/** ITSM Incidents & Incident Tasks in last 30 days
* CSM INTs and INT tasks daily: DEFN1003915
* ITSM INTs Daily: DEFN1003905
* ITSM INT tasks Daily: DEFN1003908*/

answer = getTotalITSMInts();

function getTotalITSMInts() {
	
	var csmIntDefn = 'DEFN1003915';
	var intDefn = 'DEFN1003905';
	var intTaskDefn = 'DEFN1003908';

	var csmTotal = getAggCountLast30Days(csmIntDefn);
	var intTotal = getAggCountLast30Days(intDefn);
	var intTaskTotal = getAggCountLast30Days(intTaskDefn);
	
	return (parseInt(intTotal) + parseInt(intTaskTotal) - parseInt(csmTotal));
	
}

function getAggCountLast30Days(defId) {
	
	if (gs.nil(defId)) return 0;
	
	var encQuery = gs.getMessage("definition_id={0}^time_stampBETWEENjavascript:gs.beginningOfLast30Days()@javascript:gs.endOfLast30Days()", defId);
	var ga = new GlideAggregate("usageanalytics_count");
		ga.addEncodedQuery(encQuery);
		ga.addAggregate("SUM", "count");
		ga.setGroup(false);
		ga.query();
		while(ga.next()) {
			return ga.getAggregate("SUM", "count");
		}
	
	return 0;
}
