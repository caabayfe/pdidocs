(function(context) {
    if (CIPlugin.IAR().isActive()) {
        context.props_details.footer_type = 'status';
        context.props_details.status = (new sn_oe_sfs.CIUtil().isIarEnabled()) ? 'on' : 'off';
    } else {
        context.props_details.footer_type = 'text';
        context.props_details.footer = '';
    }
    context.props_details.show_border = true;

})(context);
