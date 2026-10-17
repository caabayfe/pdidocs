(function refineQuery(current, parent) {
    var daUtil = new DeclarativeActionUtil();
    var daSysId = parent.sys_id;
    var uxFormActionGr = daUtil.getUxFormAction(daSysId);
    var uxFormActionSysId;

    if (uxFormActionGr) {
        uxFormActionSysId = uxFormActionGr.getUniqueValue();
    }

    return daUtil.getLayoutItems(current, uxFormActionSysId);
})(current, parent);
