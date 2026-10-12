(function(context, pageParams) {
    context.props_details.endpoint = 'identity-center-details?indicatorId=c941a33f77301110638cfe21fe5a9974&listTable=sn_vsc_icenter_privileged_users_details&listTitle=Privileged users need to reset password&listFilter=' + encodeURIComponent('usr_password_needs_reset=true') + '&listSort=ORDERBYDESCusr_sys_created_on&listColumns=usr_user_name,usr_name,userrole_role,usr_email,usr_active,usr_sys_created_on,usr_sys_updated_on';
    context.title = gs.getMessage("Need to reset password");
})(context, pageParams);
