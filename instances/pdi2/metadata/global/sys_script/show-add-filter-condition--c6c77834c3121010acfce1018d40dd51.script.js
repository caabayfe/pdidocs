(function executeRule(current, previous /*null when async*/ ) {
    g_scratchpad.showAddFilterCondition = false;
    if (!current.isNewRecord()){
        if (current.has_filter) {
            g_scratchpad.showAddFilterCondition = true;
        } else {
            var ed = new GlideRecord(current.entity.table).getElement(current.field).getED();
            g_scratchpad.showAddFilterCondition = (ed.getInternalType() == 'reference');
        }
    }
})(current, previous);
