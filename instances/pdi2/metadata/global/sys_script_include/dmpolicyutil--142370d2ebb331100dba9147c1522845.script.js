var DMPolicyUtil = Class.create();
DMPolicyUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    hasNoOrActivePolicy: function(tablename) {
        var policyGr = new GlideRecord('sys_dm_policy');
        if (!policyGr.isValid())
            return true;

        if (policyGr.get('tablename', tablename)) {
            return (policyGr.getValue('active') == 1);
        } else {
            return true;
        }
    },

    //to support calling from client script
    hasActiveTablePolicy: function() {
        var tablename = this.getParameter('sysparm_tablename');
        return this.hasNoOrActivePolicy(tablename);
    },


    //to support calling from client script
    isColumnarTable: function() {
        var tablename = this.getParameter('sysparm_tablename');
        if (!GlideTableDescriptor.isValid(tablename))
            return false;

        return GlideTableDescriptor.get(tablename).isColumnarTable();
    },


    findOrCreatePolicyForTable: function(tablename) {
        var gr = new GlideRecord('sys_dm_policy');
        if (!gr.isValid())
            return null;

        if (gr.get('tablename', tablename)) {
            return gr.getUniqueValue();
        } else {
            gr.initialize();
            gr.setValue('name', tablename + ' policy');
            gr.setValue('tablename', tablename);
            gr.setValue('active', 1);
            return gr.insert();
        }
    },

    type: 'DMPolicyUtil'
});
