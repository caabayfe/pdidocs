(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var body = request.body.data;
    var bs_id = body.bsId;


    var eps = []; // array for holding Entry Points
	eps.push(bs_id);
    var epsGR = new GlideRecord('sa_m2m_service_entry_point');
    epsGR.addQuery('cmdb_ci_service', bs_id);
	epsGR.addQuery('cmdb_ci_endpoint.sys_class_name', '!=', 'cmdb_ci_endpoint_manual');
	epsGR.query();

    // add the entry points to array
    while (epsGR.next()) {
           eps.push(epsGR.cmdb_ci_endpoint.toString());
    }


    // search for "parent" Application Services having endpoints equal to
    // current Discovered Service's entry point(s)
    var parentService = new GlideRecord('svc_ci_assoc');
    parentService.addQuery('ci_idIN' + eps.toString());
    parentService.addQuery('service_id', '!=', bs_id);
    parentService.orderBy('service_id.name');
    parentService.query();

    var parents = parentService.getRowCount();

    var parentsList = [];
    //var parentNames = Array();
    var parentIds = [];
    var serviceId;
    var serviceName;
    while (parentService.next()) {
        var ciId = parentService.getValue('ci_id');
        serviceId = parentService.getValue('service_id');
        if (ciId == serviceId) {
            continue;
        }
        serviceName = parentService.service_id.name;
        parentIds.push(serviceId);
    }

    var cmdbServGr = new GlideRecord('cmdb_ci_service_discovered');
    cmdbServGr.addQuery('sys_id', parentIds);
    cmdbServGr.query();

    var userId = gs.getUserID();
    var pluginMode = body.pluginMode;
    var bsManager = new SNC.BusinessServiceManager();
    while (cmdbServGr.next()) {
        var answer = bsManager.isReadingPermitted(cmdbServGr, userId);
        if (answer) {
            if (pluginMode != 'assurance' || cmdbServGr.operational_status == '1') {
                parentsList.push({
                    "sysId": cmdbServGr.getValue('sys_id'),
                    "name": cmdbServGr.getValue('name')
                });
            }
        }
    }

    return parentsList;

})(request, response);
