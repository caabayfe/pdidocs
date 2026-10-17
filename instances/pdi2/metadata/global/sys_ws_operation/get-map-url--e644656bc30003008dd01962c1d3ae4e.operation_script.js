/* 
 * Giving sys_id on sa_service_counters, responds with navigation url for requested service map.
 * Alternatively, if parameter is_bs_id=true passed, when the give sys_id will be treated as sys_id from cmdb_ci_service_discovered table.
 * response object can be either map url or a message for user with reason why the map cannot be opened.
 * {
 * url {String} - url for discovered service map page. Provided when it's valid and the map cn be viewed.
 * message {String} - translated message for user wit hreason why map cannot be opened.
 *  If 'message' provided, then no 'url' will be provided.
 * }
 */
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var sysId = request.pathParams.service_counters_id;
	var isBsId = false;
	if (request.queryParams && request.queryParams["is_bs_id"] && request.queryParams["is_bs_id"][0])
		isBsId = String(request.queryParams["is_bs_id"][0]) === "true";
	
	var manager = new SaViewServiceMap();
	var serviceId = isBsId ? sysId : manager.getServiceIdFromSaCountersId(sysId);
	
	if (!serviceId)
		return {
			message: gs.getMessage("Invalid id {0} : no related service sys_id", [sysId])
		};
	
	return manager.getMapUrl(serviceId);
})(request, response);
