answer = getMaxCommentsOrWorknotes();
function getMaxCommentsOrWorknotes() {
    var maxCommentsOrWnPerInc = 0;
    var sysjournalGA = new GlideAggregate('sys_journal_field');
    if (sysjournalGA.isValid()) {
        sysjournalGA.addQuery('sys_created_on', '>=', 'javascript:gs.beginningOfLastMonth()');
        sysjournalGA.addQuery('sys_created_on', '<', 'javascript:gs.beginningOfThisMonth()');
        sysjournalGA.addQuery('name', '=', 'incident');
        sysjournalGA.addQuery('element', 'IN', 'comments,work_notes');
        sysjournalGA.addAggregate('COUNT', 'element_id');
        sysjournalGA.orderByAggregate('COUNT', 'element_id');
        sysjournalGA.setWorkflow(false);
        sysjournalGA.query();
        if (sysjournalGA.next())
            maxCommentsOrWnPerInc = Number(sysjournalGA.getAggregate('COUNT', 'element_id'));
    }
    return maxCommentsOrWnPerInc;
}
