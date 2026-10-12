(function(context, pageParams){  
    var text = gs.getMessage('Integrations') + ' (' + new sn_oe_sfs.CIUtil().getIntegrationsCount() + ')';
    var messageText = '<h3 style=\'font-weight:600;font-size: 16px;\'>' + text + '</h3>';
    context.props_details.html = messageText;
 })(context, pageParams);
