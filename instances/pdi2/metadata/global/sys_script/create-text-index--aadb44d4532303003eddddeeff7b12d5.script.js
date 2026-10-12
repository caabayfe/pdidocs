doit();

function doit() {
    var currentAppId = gs.getCurrentApplicationId();
    var dictGr = new GlideRecord('sys_dictionary');
    dictGr.addQuery('name', current.source_table);
    dictGr.addQuery('element', '');
    dictGr.addQuery('text_index', false);
    dictGr.query();
    if (dictGr.next()) {
        gs.log('Setting text_index flag to true for all tables in the same composite as ' + current.source_table);
        var dbom = new GlideDBObjectManager.get();
        var base = dbom.getAbsoluteBase(current.source_table);
        var tables = dbom.getAllExtensions(base);
        var u = new GlideUpdateManager2();
        var q = new GlideRecord('sys_dictionary');
        q.addQuery('element', '');
        q.addQuery('name', tables);
        q.addQuery('text_index', false);
        q.query();
        var skippedTableInUpdateSet = [];
        while (q.next()) {
            q.text_index = true;
            q.setWorkflow(false); //turn off workflow so cache is not flushed each time
            q.update();
            if (currentAppId != q.getValue('sys_scope')) {
                skippedTableInUpdateSet.push(q.getValue('name'));
                continue;
            }
            u.saveRecord(q); //write out an XML update since workflow was off
        }
        if (skippedTableInUpdateSet.length > 0)
            gs.addInfoMessage(gs.getMessage("Setting text_index = true to hierachical tables {0} were not saved to the current update set due to their scopes being different from current application scope '{1}'", [JSON.stringify(skippedTableInUpdateSet), currentAppId]));

        GlideTextIndexEvent().indexUpdate(current.source_table, '');
        gs.addInfoMessage(gs.getMessage('The table you selected has not been text indexed.  Indexing of this table has started and when complete information from this table will be available in search.'));
    }
}
