(function(context, pageParams, blockcontext, dataParams) {

    var channel = 'a812eaf8c32111100f24c87af040dd59';
    var query = '';
    var groupTable = 'sys_user_group';
    var userTable = 'sys_user';
    var util = new sn_oe_sfs.CollabConfigurationUtil();
    var result = util.buildQueryResult(channel, query,  groupTable);

    context.props_details.groupItems = result.availableResult;
    context.props_details.groupSelectedItems = result.selectedResult;
    result = util.buildQueryResult(channel, query,  userTable);
    context.props_details.userItems = result.availableResult;
    context.props_details.userSelectedItems = result.selectedResult;
})(context, pageParams, blockcontext, dataParams);
