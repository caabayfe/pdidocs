if (current.operational_status == 4 || current.operational_status ==5) {
    // if it's a test or a demo instance we do not care
} else {
    // go forth and look for a news article already in existence
    var desc = current.name + " is DOWN";
    if (current.operational_status == 3)
        desc = current.name + " is UNDER REPAIR";
    if (current.operational_status == 1)
        desc = current.name + " is BACK UP";

    var kb = new GlideRecord('kb_knowledge');
    kb.addQuery('cmdb_ci', current.sys_id);
    kb.orderByDesc('sys_created_on');
    kb.query();
    if (kb.next()) {
        kb.short_description = desc;
        kb.update();
    } else {
        if (current.operational_status == 1) {
            // we're currently running and we don't have a news article saying we're down
            // hence we're done
        } else {
            // PRB1506382 - Check if current user can create knowledge record
        	if (new KBKnowledge().canCreate()) {
                kb.initialize();  
                kb.short_description = desc;
                kb.cmdb_ci = current.sys_id;
                kb.topic = 'News';
                kb.insert();
            }
        }
    }
}
