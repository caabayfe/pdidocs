function transform(input) {
    var sysId = input.sys_id;
    var result = {};

    if (sysId == "")
        return;
    try {
        result = new sn_sow_inc.PIRManager().fetchIncidentRelatedData(sysId);
        return result;
    } catch (e) {
        gs.error("Failed to fetch incident related data : " + e);
        return new Error("Failed to fetch incident related data");
    }
}
