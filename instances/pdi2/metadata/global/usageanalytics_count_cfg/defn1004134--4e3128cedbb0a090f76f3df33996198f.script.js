/** ITSM Tasks in last 365 days
* CSM TASK Daily Definitions: DEFN1003909,DEFN1003914,DEFN1003912,DEFN1003915
* ITSM TASK Daily Definitions: ['DEFN1000504', 'DEFN1003906', 'DEFN1003905', 'DEFN1003908', 'DEFN1003902', 'DEFN1003907', 'DEFN1003903', 'DEFN1003904'] */

answer = getITSMOnlyTransactions();

function getITSMOnlyTransactions() {

	var csmDefns = ['DEFN1003914', 'DEFN1003915', 'DEFN1003909', 'DEFN1003912'];
	var itsmDefns = ['DEFN1000504', 'DEFN1003906', 'DEFN1003905', 'DEFN1003908', 'DEFN1003902', 'DEFN1003907', 'DEFN1003903', 'DEFN1003904'];

	var csmTotal = getAggCountLast365Days(csmDefns);
	var itsmTotal = getAggCountLast365Days(itsmDefns);
	var itsmOnlyTasks = (parseInt(itsmTotal) - parseInt(csmTotal));

	return (itsmOnlyTasks > 0 ? itsmOnlyTasks : 0);
}

function getAggCountLast365Days(defnArr) {

	if (gs.nil(defnArr) || defnArr.length <= 0) return 0;

	var encQuery = gs.getMessage("definition_idIN{0}^time_stamp>javascript:gs.daysAgo(365)", defnArr.join());
	var ga = new GlideAggregate("usageanalytics_count");
		ga.addEncodedQuery(encQuery);
		ga.addAggregate("SUM", "count");
		ga.setGroup(false);
		ga.query();
		if (ga.next()) {
			return ga.getAggregate("SUM", "count");
		}

	return 0;
}
