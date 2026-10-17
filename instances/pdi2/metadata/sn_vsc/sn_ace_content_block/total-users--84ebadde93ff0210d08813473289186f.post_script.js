(function(context, pageParams) {
    var queryCondition = '""';
    if (new GlideRecord('sys_user').isValidField('identity_sub_type')) {
        queryCondition = "identity_sub_type!=visitor^ORidentity_sub_typeISEMPTY";
    }
    context.props_details.endpoint = 'identity-center-details?indicatorId=a3ea576ceb201110f32fed9c425228ac&listTable=sys_user&listTitle=Total users&listFilter=' + encodeURIComponent(queryCondition) + '&listSort=ORDERBYDESCsys_created_on&listColumns=user_name,name,email,active,sys_created_on,sys_updated_on';
    context.title = gs.getMessage("Total users");
})(context, pageParams);
