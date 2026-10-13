(function checkPIRTabVisiblity(params) {
    var table = params.data.table;
    var sysId = params.data.sysId;

    if (table == null || sysId == null || table !== 'incident')
        return false;

    var incGr;
    try {
        incGr = GlideRecordCache.getOrQuery(table, sysId);
        if (!incGr || !incGr.isValidRecord() || !incGr.canRead())
            return false;
    } catch (e) {
        incGr = new GlideRecord(table);
        if (!incGr.get(sysId) || !incGr.canRead())
            return false;
    }

    if (incGr.getValue('major_incident_state') == 'accepted' && (incGr.getValue('state') == 6 || incGr.getValue('state') == 7)) {
        var pGr = new GlideRecord('sn_sow_inc_post_incident_review');
        pGr.addQuery('incident_ref', sysId);
        pGr.setLimit(1);
        pGr.query();
        return pGr.hasNext();
    }
    return false;
})(inputProperties);
