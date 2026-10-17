(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
 var groupId = JSUtil.nil(request.queryParams.group_id) ? "" : request.queryParams.group_id;
 return {
	"escalations": new OnCallEscalationUtil().setCheckAccess(true).getEscalations(request.queryParams.source, request.queryParams.table, groupId)
 };

})(request, response);
