(function(context, pageParams) {
    context.props_details.endpoint = 'sc-integration-users-info?indicatorId=37ef9ec47fb01210114d91fadc86652e&listTable=sys_user_mfa_enforcement_info&listTitle=Integration Accounts without Web Service Access Only Flag enabled&listFilter='+encodeURIComponent('user_category=hybrid^user.web_service_access_only=false^ORuser.web_service_access_onlyISEMPTY') + '&listSort=ORDERBYDESCsys_created_on&listColumns=user';
    context.title = gs.getMessage("Integration Accounts without Web Service Access Only Flag enabled");
})(context, pageParams);
