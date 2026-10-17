(function(context, pageParams) {
    var queryCondition = "active=false";
    if (new GlideRecord('sys_user').isValidField('identity_sub_type')) {
        queryCondition += "^identity_sub_type!=visitor^ORidentity_sub_typeISEMPTY";
    }
    context.props_details.endpoint = 'identity-center-details?indicatorId=cc5bfb4420c45910f877de4b9ee9cc69&listTable=sys_user&listTitle=Inactive users&listFilter=' + encodeURIComponent(queryCondition) + '&listSort=ORDERBYDESCsys_created_on&listColumns=user_name,name,email,active,sys_created_on,sys_updated_on';
    context.title = gs.getMessage("Inactive users");
})(context, pageParams);
