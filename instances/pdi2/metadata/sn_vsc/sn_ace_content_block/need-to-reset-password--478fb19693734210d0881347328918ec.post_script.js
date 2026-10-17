(function(context, pageParams){ 
    var queryCondition = "password_needs_reset=true";
    if (new GlideRecord('sys_user').isValidField('identity_sub_type')) {
        queryCondition += "^identity_sub_type!=visitor^ORidentity_sub_typeISEMPTY";
    }
    context.props_details.endpoint = 'identity-center-details?indicatorId=1f8b0622eb401110f32fed9c42522833&listTable=sys_user&listTitle=Need to reset password&listFilter='+encodeURIComponent(queryCondition)+'&listSort=ORDERBYDESCsys_created_on&listColumns=user_name,name,email,active,sys_created_on,sys_updated_on';
    context.title = gs.getMessage("Need to reset password");
})(context, pageParams);
