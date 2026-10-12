(function(context, pageParams) {
    var util = new sn_instance_clone.AdminCloneUtil();
    var record = util.getCloneStatusRequestData(pageParams.sysId);
    context.props_details.cloneStatusData = record.body;
})(context, pageParams);
