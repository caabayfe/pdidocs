(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var flowActionGr = new GlideRecord('sys_hub_action_type_definition');
	flowActionGr.addActiveQuery();
    flowActionGr.query();

    var flowActionData = [];
    while (flowActionGr.next()) {
        flowActionData.push({
            id: flowActionGr.getUniqueValue(),
            label: flowActionGr.getValue('name'),
            scope: flowActionGr.sys_scope.source,
            internal_name: flowActionGr.getValue('internal_name')
        });
    }

    response.setBody(flowActionData);

})(request, response);
