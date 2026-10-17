function transform(input) {
    if (!input.table_name)
        return false;
    var tableName = input.table_name;
    try {
        var epoints = new GlideScriptedExtensionPoint().getExtensions('sn_uib_tcm.CommunicationAnnouncementConfig');
        for (var i = 0; i < epoints.length; i++) {
            var point = epoints[i];
            if (point.getTableName() === tableName) {
                return (gs.hasRole('announcement_admin') && point.isManageAnnouncementsSupported(tableName, input.sysId));
            }
        }
        return false;
    } catch (ex) {
        gs.error('Error running extension points!');
        return false;
    }
}
