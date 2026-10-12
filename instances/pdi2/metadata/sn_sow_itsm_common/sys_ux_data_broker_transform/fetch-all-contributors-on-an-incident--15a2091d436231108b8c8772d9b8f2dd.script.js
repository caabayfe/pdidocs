function transform(input) {
    var table = input.table;
    var gr = new GlideRecord(table);
    if (gr.get(input.sysId) && gr.canRead()) {
        if (table == 'incident') {
            var recordInfo = new sn_sow_inc.SOWIncidentInfo(gr);
            return recordInfo.getAllContributors(); 
        }
    }
    return {};
}
