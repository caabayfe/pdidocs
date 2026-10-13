var EvtMgmtMidExtContextDeletionUtil = Class.create();
EvtMgmtMidExtContextDeletionUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    filterSysIdsByCondition: function() {
        var filteredSysIdList = [];
        var sysIds = this.getParameter('sysparm_sysIds');
        var encodedCondition = this.getParameter('sysparm_encodedCondition');

        var gr = new GlideRecord("ecc_agent_ext_context");
        gr.addQuery("sys_id", "IN", sysIds);
        gr.addEncodedQuery(encodedCondition, true);
        gr.query();
        while (gr.next())
            filteredSysIdList.push(gr.getUniqueValue());

        return JSON.stringify(filteredSysIdList);
    },

    type: 'EvtMgmtMidExtContextDeletionUtil'
});
