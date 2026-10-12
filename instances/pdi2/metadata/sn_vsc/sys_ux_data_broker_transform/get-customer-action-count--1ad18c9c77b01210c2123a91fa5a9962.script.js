function transform(input) {
    var notCompletedCA = 0;
    var overdueCA = 0;
    var scConstants = new sn_vsc.SecurityCenterConstants();
    if (gs.hasRole(scConstants.SC_ADMIN_ROLE)) {
        var gr = new GlideRecord('sn_critical_update');
        gr.addQuery('up_active', true);
        gr.addQuery('up_update_status', '!=', 'acknowledged');
        gr.query();
        notCompletedCA = gr.getRowCount();
        gr = new GlideRecord('sn_critical_update');
        gr.addQuery('up_active', true);
        gr.addQuery('up_update_priority', 'overdue');
        gr.query();
        overdueCA = gr.getRowCount();
    }
    return {
        'notCompletedCA': notCompletedCA,
        'overdueCA': overdueCA
    };
}
