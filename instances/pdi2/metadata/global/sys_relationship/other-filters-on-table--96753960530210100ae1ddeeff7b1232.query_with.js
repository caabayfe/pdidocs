(function refineQuery(current, parent) {
    if (parent.type == 2) {
        var reference = current.addQuery('reference_table', parent.reference_table);
        reference.addOrCondition('source_table', parent.reference_table);
        reference.addOrCondition('boolean_table', parent.reference_table);
    } else if (parent.type == 1) {
        var source = current.addQuery('source_table', parent.source_table);
        source.addOrCondition('reference_table', parent.source_table);
        source.addOrCondition('boolean_table', parent.source_table);
    } else if (parent.type == 5) {
        var choice = current.addQuery('boolean_table', parent.boolean_table);
        choice.addOrCondition('reference_table', parent.boolean_table);
        choice.addOrCondition('source_table', parent.boolean_table);
    } else {
        current.addEncodedQuery("sys_idISEMPTY");
    }
    current.addQuery('sys_id', '!=', parent.sys_id);
})(current, parent);
