function transform(input) {
    var table = input.sourceTable;
    var sysId = input.sourceSysId;
    var output = {
        canView: false
    };

    if (gs.nil(table) || gs.nil(sysId) || (sysId === '-1')) return output;

    var recordGr = new GlideRecord(table);
    if (recordGr.get(sysId) && recordGr.canRead()) {
        output.canView = new sn_uib_collab.CollabUtils().canViewCalls(table, sysId) || new sn_uib_collab.CollabUtils().canViewChats(table, sysId);
    }

    return output;
}
