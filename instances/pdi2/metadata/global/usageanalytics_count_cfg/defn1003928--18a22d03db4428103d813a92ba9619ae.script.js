/** ITSM Problem & ProblemTasks in last 30 days
* CSM PRBs and PRB tasks daily: DEFN1003912
* ITSM PRBs Daily: DEFN1003903
* ITSM PRB tasks Daily: DEFN1003904*/

answer = getTotalITSMPrbs();

function getTotalITSMPrbs() {
	
	var csmPrbDefn = 'DEFN1003912';
	var prbDefn = 'DEFN1003903';
	var prbTaskDefn = 'DEFN1003904';

	var csmTotal = getAggCountLast30Days(csmPrbDefn);
	var prbTotal = getAggCountLast30Days(prbDefn);
	var prbTaskTotal = getAggCountLast30Days(prbTaskDefn);
	
	return (parseInt(prbTotal) + parseInt(prbTaskTotal) - parseInt(csmTotal));
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
