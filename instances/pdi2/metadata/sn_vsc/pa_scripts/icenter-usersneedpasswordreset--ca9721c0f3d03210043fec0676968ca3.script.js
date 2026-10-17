getCount();

function getCount() {
    var gr = new GlideAggregate('sys_user');
    gr.addQuery('password_needs_reset', true);
    if (new GlideRecord('sys_user').isValidField('identity_sub_type'))
        gr.addEncodedQuery('identity_sub_type!=visitor^ORidentity_sub_typeISEMPTY', true);
    gr.addAggregate('COUNT');
    gr.query();

    if (gr.next())
        return gr.getAggregate('COUNT');
    return 0;
}
