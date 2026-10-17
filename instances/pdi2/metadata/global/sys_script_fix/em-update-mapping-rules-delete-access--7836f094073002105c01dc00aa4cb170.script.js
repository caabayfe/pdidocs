var tables = ["em_mapping_rule", "em_mapping_pair"];

var evtMgmtCommons = new EvtMgmtCommons();
if (!evtMgmtCommons.isNewInstance()) {

    for (var i = 0; i < tables.length; i++) {
        if (!updateDeleteAccess(tables[i]))
            break;
    }
}

function updateDeleteAccess(tableName) {

    var dbObj = new GlideRecord("sys_db_object");
    dbObj.addQuery("name", tableName);
    dbObj.query();
    if (dbObj.next()) {
        var existingValue = dbObj.getDisplayValue("delete_access");

        if (existingValue === 'false') {
            dbObj.setValue("delete_access", true);
            if (dbObj.update()) {
                gs.log('EM - Update mapping rules delete access: Enabled delete access for scoped applications on ' + tableName);
                return true;
            } else {
                gs.log('EM - Update mapping rules delete access: ERROR: could not update delete_access for ' + tableName);
                return false;
            }

        }
    }
}
