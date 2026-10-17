(function executeRule(current, previous /*null when async*/ ) {
    var newRel = '';
    if (current.relationship.indexOf('parent') == 0)
        newRel = ('child:' + current.cmdb_rel_type).trim();
    else
        newRel = ('parent:' + current.cmdb_rel_type).trim();

    var gr = new GlideRecord('em_suggested_relation_type');
    gr.addQuery('cmdb_rel_type', current.cmdb_rel_type);
    gr.addQuery('relationship', newRel);
    gr.addQuery('base_class', current.dependent_class);
    gr.addQuery('dependent_class', current.base_class);
    gr.query();
    if (gr.next())
        return; // already have one

    gr = new GlideRecord('em_suggested_relation_type');
    gr.sys_scope = current.sys_scope;
    gr.base_class = current.dependent_class;
    gr.dependent_class = current.base_class;
    gr.relationship = newRel;
    gr.cmdb_rel_type = current.cmdb_rel_type;
    gr.skip_validation = true;
    gr.insert();
})(current, previous);
