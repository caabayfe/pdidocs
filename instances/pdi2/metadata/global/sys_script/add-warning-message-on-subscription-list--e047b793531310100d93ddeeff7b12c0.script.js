(function executeRule(current, previous /*null when async*/ ) {

    try {
        if (this.hasOwnProperty('RP') && RP.isHomePage())
            return;

        if (!this.hasOwnProperty('ListProperties') || JSUtil.nil(ListProperties))
            return;

        if (JSUtil.nil(ListProperties.getTable()))
            return;

        if (ListProperties.getTable() + '' != 'license_details')
            return;

        if (ListProperties.isRelatedList())
            return;

        if (ListProperties.isEmbeddedList())
            return;

        var isComplianceRequired = sn_lef.GlideEntitlement.isLicenseComplianceRequired();
        if (!isComplianceRequired)
            gs.addInfoMessage(gs.getMessage("In a non-production environment, your subscription allocation counts will not match with production."), "InfoWillNotMatchProd");
    } catch (e) {
        //ignore the error
    }

})(current, previous);
