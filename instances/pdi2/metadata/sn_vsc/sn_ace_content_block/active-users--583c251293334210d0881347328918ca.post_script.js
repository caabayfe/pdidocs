(function(context, pageParams) {
    var queryCondition = "active=true";
    if (new GlideRecord('sys_user').isValidField('identity_sub_type')) {
        queryCondition += "^identity_sub_type!=visitor^ORidentity_sub_typeISEMPTY";
    }
    context.props_details.endpoint = 'identity-center-details?indicatorId=c4aedf0820445910f877de4b9ee9ccef&listTable=sys_user&listTitle=Active users&listFilter=' + encodeURIComponent(queryCondition) + '&listSort=ORDERBYDESCname&listColumns=user_name,name,email,active,sys_created_on,sys_updated_on';
    context.title = gs.getMessage("Active users");
})(context, pageParams);
