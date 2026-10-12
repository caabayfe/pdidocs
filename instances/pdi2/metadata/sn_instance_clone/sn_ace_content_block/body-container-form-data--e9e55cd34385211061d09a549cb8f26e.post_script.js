(function(context, pageParams) {
    var util = new sn_instance_clone.AdminCloneUtil();
    var record = util.getCloneRequestData(pageParams.sysId);
    context.props_details.cloneStatusData = record;
})(context, pageParams);
