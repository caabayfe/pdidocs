/** ITSM Problem & ProblemTasks in last 30 days
* CSM REQs and REQ tasks daily: DEFN1003909
* ITSM REQs Daily: DEFN1003902
* ITSM REQ tasks Daily: DEFN1003907*/

answer = getTotalITSMReqs();

function getTotalITSMReqs() {
	var csmReqDefn = 'DEFN1003909';
	var reqDefn = 'DEFN1003902';
	var reqTaskDefn = 'DEFN1003907';

	var csmTotal = getAggCountLast30Days(csmReqDefn);
	var reqTotal = getAggCountLast30Days(reqDefn);
	var reqTaskTotal = getAggCountLast30Days(reqTaskDefn);
	
	return (parseInt(reqTotal) + parseInt(reqTaskTotal) - parseInt(csmTotal));	
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
