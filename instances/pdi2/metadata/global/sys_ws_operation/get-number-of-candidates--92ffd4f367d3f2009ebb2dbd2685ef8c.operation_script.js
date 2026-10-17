(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var bsGlideRecord = new GlideAggregate("cmdb_ci_service_discovered");
	bsGlideRecord.addAggregate('COUNT');
	bsGlideRecord.addQuery("process_status", "0");
	bsGlideRecord.query();
	if(bsGlideRecord.hasNext())
		bsGlideRecord.next();
	return bsGlideRecord.getAggregate('COUNT');

})(request, response);
