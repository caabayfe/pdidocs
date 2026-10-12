(function(context, pageParams) {
    var queryCondition = "active=false^locked_out=false";
    if (new GlideRecord('sys_user').isValidField('identity_sub_type')) {
        queryCondition += "^identity_sub_type!=visitor^ORidentity_sub_typeISEMPTY";
    }
    context.props_details.endpoint = 'identity-center-details?indicatorId=8785041020085910f877de4b9ee9ccaa&listTable=sys_user&listTitle=Inactive users who are not locked out&listFilter=' + encodeURIComponent(queryCondition) + '&listSort=ORDERBYDESCsys_created_on&listColumns=user_name,name,email,active,sys_created_on,sys_updated_on';
    context.title = gs.getMessage("Inactive users who are not locked out");
})(context, pageParams);
