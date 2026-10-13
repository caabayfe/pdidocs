(function executeRule(current, previous /*null when async*/) {
	var nodeLogger = new SNC.NodeLogger("sa_performance_statistics");
	var util= new global.GlideRecordUtil();
	var hashmap={};
	//parse GR to Json obj
	util.populateFromGR(hashmap,current);
	//parse Json obj to string
	var json = JSON.stringify(hashmap);
	//write to node log the record
	nodeLogger.info(json);

})(current, previous);
