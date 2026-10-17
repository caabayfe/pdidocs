
function onBefore(current, previous) {
    try {
        if (RP.isHomePage())
            return;

        if (LicensingScriptUtil.nil(ListProperties))
            return;

        if (LicensingScriptUtil.nil(ListProperties.getTable()))
            return;

        if (ListProperties.getTable() + '' != 'subscription_entitlement')
            return;

        if (ListProperties.isRelatedList())
            return;

        if (ListProperties.isEmbeddedList())
            return;

        var viewName = ListProperties.getView();
        if (LicensingScriptUtil.notNil(viewName)) {
            if ((viewName.indexOf("rpt-temp") == 0) || (viewName.indexOf("RPT") == 0))
                return;
        }

        var unmappedTableCount = SNC.CustomTableUtils.getUnmappedTableCount();
        if (unmappedTableCount > 0) {
            var link = SNC.CustomTableUtils.getInventoryURI();
            gs.flushMessages();
            gs.addInfoMessage(gs.getMessage('warn_user_of_subscription_ct_impact', link));
        }
    } catch (e) {}
}
