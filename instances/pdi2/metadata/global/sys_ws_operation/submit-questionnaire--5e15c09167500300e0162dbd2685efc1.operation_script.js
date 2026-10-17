(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var sanitize = new ServiceMappingSanitizeIdAPI();
	var serviceId = sanitize.sanitizeIdString(request.body.data.serviceId);
	var processStatus = request.body.data.processStatus;

	if(serviceId){
		var gr = new GlideRecord('service_process_task');
		gr.addQuery('business_service', serviceId);
		gr.addQuery('assigned_to', gs.getUserID());
		gr.addQuery('type', 0);
		gr.query();
		while(gr.next()){
		   gr.state=3;
		   gr.update();
		}

		var serviceGR = new GlideRecordSecure('cmdb_ci_service_discovered');
		serviceGR.addQuery('sys_id', serviceId);
		serviceGR.query();
		while(serviceGR.next()){
		   serviceGR.process_status=processStatus;
		   serviceGR.update();
		}
	}

})(request, response);
