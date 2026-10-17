(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('cmdb_dynamic_ire_feature_set');
    if (gr.get(current.feature_record)) {
        if (gr.canDelete())
            gr.deleteRecord();
    }
})(current, previous);
