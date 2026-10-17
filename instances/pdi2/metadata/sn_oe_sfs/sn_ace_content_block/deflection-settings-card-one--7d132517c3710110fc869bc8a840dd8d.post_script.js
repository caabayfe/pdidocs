(function(context) {
    context.props_details.show_border = true;
    var ciUtil = new sn_oe_sfs.CIUtil();
    if (ciUtil.isDeflectionTrackingEnabled()) {
        context.props_details.footer_text = gs.getMessage('Deflection configurations ({0})', ciUtil.getDeflectionConfigurationCount());
    }
})(context);
