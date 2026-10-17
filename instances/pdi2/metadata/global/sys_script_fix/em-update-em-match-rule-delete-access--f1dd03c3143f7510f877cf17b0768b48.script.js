var evtMgmtCommons = new EvtMgmtCommons();
if (!evtMgmtCommons.isNewInstance()) {
	
    var dbObj = new GlideRecord("sys_db_object");
    dbObj.addQuery("name", "em_match_rule");
    dbObj.query();
    if (dbObj.next()) {
        var existingValue = dbObj.getDisplayValue("delete_access");

        if (existingValue === 'false') {
            dbObj.setValue("delete_access", true);
            if (dbObj.update()) {
                gs.log('EM - Update em_match_rule delete access: Enabled delete access for scoped applications on em_match_rule');
            } else {
                gs.log('EM - Update em_match_rule delete access: ERROR: could not update delete_access for em_match_rule');
            }
        }
    }
}
