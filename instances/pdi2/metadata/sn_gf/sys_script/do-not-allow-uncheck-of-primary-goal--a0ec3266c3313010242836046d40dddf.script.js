(function executeRule(current, previous /*null when async*/ ) {

    var displayLabel = sn_gf.GFUtil.getDisplayLabel();
    gs.addErrorMessage(gs.getMessage("Disabling the primary {0} relationship is not allowed.", GlideStringUtil.escapeHTML(displayLabel)));
    current.setAbortAction(true);

})(current, previous);
