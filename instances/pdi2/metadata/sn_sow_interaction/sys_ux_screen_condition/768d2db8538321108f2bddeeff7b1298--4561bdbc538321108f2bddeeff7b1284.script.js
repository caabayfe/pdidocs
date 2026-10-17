(function showWalkupRecordInformationTab(params) {
    if (params.data.sysId == "-1")
        return true;

    var intGr = new GlideRecord('interaction');
    if (intGr.get(params.data.sysId) && intGr.canRead())
        return intGr.getValue('type') !== "walkup";
    return false;
})(inputProperties);
