(function showCollaborateTab(params) {
    var table = params.data.table;
    var sysId = params.data.sysId;

    if ((sysId === '-1') || gs.nil(table) || gs.nil(sysId)) {
        return false;
    }

    var recordGr = new GlideRecord(table);
    if (recordGr.get(sysId) && recordGr.canWrite()) {
        return new sn_uib_collab.CollabUtils().canViewCalls(table, sysId) || new sn_uib_collab.CollabUtils().canViewChats(table, sysId);
    } else {
        return false;
    }
})(inputProperties);
