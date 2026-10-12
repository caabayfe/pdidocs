var WrapUpCodesAjaxUtility = Class.create();
WrapUpCodesAjaxUtility.prototype = {
    initialize: function() {},

    getWrapUpCodes: function(external) {
        var gr = new GlideAggregate('interaction_wrap_up_code');
        gr.addQuery('external', external);
        gr.addQuery('code', '!=', '');
        var qc = gr.addQuery('sys_scope', 'global');
        qc.addOrCondition('sys_scope', gs.getCurrentApplicationId());
        gr.groupBy('code');
        gr.addAggregate('MIN', 'sys_id');
        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            answer.add(gr.getAggregate('MIN', 'sys_id'), gr.getValue('code'));
        }
    },

    type: 'WrapUpCodesAjaxUtility'
};
