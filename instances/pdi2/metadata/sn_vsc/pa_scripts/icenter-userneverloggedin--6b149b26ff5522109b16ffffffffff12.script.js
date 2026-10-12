(function() {
    var gr = new GlideAggregate('sys_user');
    gr.addEncodedQuery('active=true^last_login_timeISEMPTY^sys_created_on<javascript:gs.beginningOfLast30Days()', true);
    if (new GlideRecord('sys_user').isValidField('identity_sub_type'))
        gr.addEncodedQuery('identity_sub_type!=visitor^ORidentity_sub_typeISEMPTY', true);
    gr.addAggregate('COUNT');
    gr.query();
    return gr.next() ? gr.getAggregate('COUNT') : 0;
})();
