var archiveTableExists = GlideTableDescriptor.isValid('ar_' + current.table);
    
if (archiveTableExists) {
    var tableArchive = new GlideAggregate('ar_' + current.table);
    tableArchive.addNotNullQuery('sys_archive_restored');
    tableArchive.addAggregate('COUNT');
    tableArchive.query();
    tableArchive.next();

    var count = tableArchive.getAggregate('COUNT');
    if (count != 0 && !current.auto_rearchive)
        gs.addInfoMessage(gs.getMessage("Running archive rule: {0}.{1} record(s) cannot be re-archived because they have been restored.", [current.name, count]));
    else
        gs.addInfoMessage(gs.getMessage("Running archive rule: {0}.", current.name));

} else {
    gs.addInfoMessage(gs.getMessage("Running archive rule: {0}.", current.name));
}

new GlideArchiver().archiveByRule(current.sys_id);
