(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	response.setContentType('application/json');

	var limit = parseInt(request.queryParams.limit, 10) || 50;
	var offset = parseInt(request.queryParams.offset, 10) || 0;

	var allServers = [
		{
			server_id: 'sn-itsm-prod',
			name: 'ServiceNow ITSM',
			transport: 'SSE',
			governance: { aict_status: 'approved' }
		},
		{
			server_id: 'sn-hrsd-prod',
			name: 'ServiceNow HR Service Delivery',
			transport: 'SSE',
			governance: { aict_status: 'approved' }
		},
		{
			server_id: 'sn-secops-prod',
			name: 'ServiceNow Security Operations',
			transport: 'SSE',
			governance: { aict_status: 'approved' }
		}
	];

	var total = allServers.length;
	var paginatedServers = allServers.slice(offset, offset + limit);

	response.setStatus(200);
	response.setBody({
		result: {
			servers: paginatedServers,
			meta: {
				total: total,
				limit: limit,
				offset: offset
			}
		}
	});
})(request, response);
