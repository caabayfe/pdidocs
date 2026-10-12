(function(context, pageParams){ 
    var queryCondition = "last_loginRELATIVELT@month@ago@6^active=true";
    if (new GlideRecord('sys_user').isValidField('identity_sub_type')) {
        queryCondition += "^identity_sub_type!=visitor^ORidentity_sub_typeISEMPTY";
    }
    context.props_details.endpoint = 'identity-center-details?indicatorId=08e98cdc77911110346bd95bbd5a99aa&listTable=sys_user&listTitle=Users not logged in since last the 6 months&listFilter='+encodeURIComponent(queryCondition)+'&listSort=ORDERBYDESCsys_created_on&listColumns=user_name,name,email,active,sys_created_on,sys_updated_on';
    context.title = gs.getMessage("Users not logged in since last 6 months");
})(context, pageParams);
