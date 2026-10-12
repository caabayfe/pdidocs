(function(context) {
    context.props_details.show_border = true;
    /**
     * If either SDH or Data Privacy is installed, show # of masking patterns, else
     * no footer text shown
     */
    var ciUtil = new sn_oe_sfs.CIUtil();
    if (CIPlugin.SensitiveDataHandling().isActive() || ciUtil.isDataPrivacyForVASupported()) {
        var sensitiveDataRegexCount = ciUtil.getSensitiveDataRegexCount();
        context.props_details.footer_text = gs.getMessage('Masking patterns ({0})', sensitiveDataRegexCount);
        context.props_details.highlight = false;
    } else {
        context.props_details.footer_text = '';
        context.props_details.highlight = true;
    }
})(context);
