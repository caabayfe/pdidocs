(function executeRule(current, previous /*null when async*/ ) {
	
    var classification = previous.getValue('data_classification');
    var infoObject = previous.getValue('information_object');
    var infoGr = new GlideRecord('cmdb_ci_information_object');
    infoGr.get(infoObject);
    var classifications = infoGr.classification.toString().split(',');
    var pos = classifications.indexOf(unescape(classification.toString()));
    classifications.splice(pos, 1);
    infoGr.setValue('classification', classifications.toString());
	infoGr.setWorkflow(false);
    infoGr.update();

})(current, previous);
