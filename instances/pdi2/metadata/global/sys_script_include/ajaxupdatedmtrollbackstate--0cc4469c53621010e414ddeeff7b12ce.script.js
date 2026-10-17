var AJAXUpdateDMTRollbackState = Class.create();
AJAXUpdateDMTRollbackState.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    setRollbackState: function() {
        var sys_id = this.getParameter('sysparm_sysId');
        var dm_table = this.getParameter('sysparm_dm_table');

        var gr = new GlideRecord(dm_table);
        if (gr.get(sys_id)) {
            if (gr.rollback_context.state == 'rolled_back') {
                gr.state = "rolled_back";
                gr.update();
            }
        }
        return '';

    },

    type: 'AJAXUpdateDMTRollbackState'
});
