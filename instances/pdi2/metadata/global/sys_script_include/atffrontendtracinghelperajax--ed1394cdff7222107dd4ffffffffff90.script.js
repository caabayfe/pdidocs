var ATFFrontendTracingHelperAjax = Class.create();
ATFFrontendTracingHelperAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    process: function() {
        var name = this.getParameter("sysparm_name");
        if (name == "addTrace")
            return this.addTrace(this.getParameter('sysparm_table_name'), this.getParameter('sysparm_sys_id'));
    },

	/**
     * Frontend metadata tracing bridge to the backend
     */
    addTrace: function(tableName, sysId) {
        if (sn_atf.AutomatedTestingFramework.isDebugEnabled())
            gs.info("Adding frontend metadata trace with requestBody " + tableName + " " + sysId);

        sn_atf.MetadataTracingUtil.trace(
            'Sys UI Frontend Span',
            sysId,
            tableName
        );
    },

    type: 'ATFFrontendTracingHelperAjax'
});
