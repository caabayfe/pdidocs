function transform(input) {
    if (!input.sysId || !input.table) return false;
    var confUtils = new NotifyUXFConferenceUtil();
    return confUtils.isActiveRecord(input.table, input.sysId);
}
