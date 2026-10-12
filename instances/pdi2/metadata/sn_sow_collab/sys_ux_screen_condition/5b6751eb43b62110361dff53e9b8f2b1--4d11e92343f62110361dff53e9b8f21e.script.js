(function showCollaborateTab(params) {
    var table = params.data.table;
    var sysId = params.data.sysId;

    if ((sysId === '-1') || gs.nil(table) || gs.nil(sysId)) {
        return false;
    }

    var recordGr = new GlideRecord(table);
    if (recordGr.get(sysId) && recordGr.canRead()) {
        return new sn_sow_collab.SowCollabUtils().canViewCalls(table, sysId) || new sn_sow_collab.SowCollabUtils().canViewChats(table, sysId);
    } else {
        return false;
    }
})(inputProperties);
