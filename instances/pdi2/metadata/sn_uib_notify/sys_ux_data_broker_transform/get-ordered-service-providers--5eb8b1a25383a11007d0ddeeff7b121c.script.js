function transform(input) {
    if (!input.table || !input.sysId)
        return;
    var confUtil = new sn_uib_notify.NotifyUXFConferenceUtilSNC();
    return confUtil.getOrderedListOfNotifyNumbersAndProviders(input.table, input.sysId);
}
