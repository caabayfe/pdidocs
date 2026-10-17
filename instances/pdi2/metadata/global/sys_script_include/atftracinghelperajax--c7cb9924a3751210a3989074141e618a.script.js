var ATFTracingHelperAjax = Class.create();
ATFTracingHelperAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    process: function() {
        var name = this.getParameter("sysparm_name");
        if (name == "getTracingTestResultDifferences")
            return this.getTracingTestResultDifferences(this.getParameter("sysparm_test_result_ids"));
        else if (name == "getUpdateVersionsForComparision")
            return this.getUpdateVersionsForComparision(this.getParameter('sysparm_what_changed_sys_id'));
        else if (name == "lookupChangeDetails")
            return this.lookupChangeDetails();
        else if (name == "getTrackerId")
            return this.getTrackerId();
    },
    /**
     * Get the metadata and test result detail from a detected change
     */

    lookupChangeDetails: function() {
        response = {};
        response.changes = [];
        response.triageTaskType = gs.getProperty("sn_atf.test.triage.task.type", "incident");

        var ids = this.getParameter('sysparm_ids');
        var gr = new GlideRecord('sys_atf_what_changed');
        gr.addQuery('sys_id', 'IN', ids);
        gr.query();

        while (gr.next()) {
            change = {};
            change.metadata_id = gr.application_file.toString();
            change.metadata_display_value = gr.application_file.getDisplayValue().toString();
            change.test_result_id = gr.sys_atf_test_result.toString();
            change.test_result_display_value = gr.sys_atf_test_result.getDisplayValue().toString();
            response.changes.push(change);
        }

        return JSON.stringify(response);
    },

    /**
     * Get the update versions to compare what changed
     */
    getUpdateVersionsForComparision: function(sysId) {
        var what_changed = new GlideRecord("sys_atf_what_changed");
        if (!what_changed.get(sysId))
            return;

        var test_result = new GlideRecord("sys_atf_test_result");
        if (!test_result.get(what_changed.getValue("sys_atf_test_result")))
            return;

        var previous_test_result = new GlideRecord("sys_atf_test_result");
        if (!previous_test_result.get(what_changed.getValue("previous_test_result")))
            return;

        var metadata = new GlideRecord("sys_metadata");
        if (!metadata.get(what_changed.getValue("application_file")))
            return;

        var version = new GlideRecord("sys_update_version");
        version.addQuery("name", metadata.sys_update_name);
        version.addQuery("sys_created_on", "<", previous_test_result.sys_created_on);
        version.addQuery("state", "!=", "current");
        version.orderByDesc("sys_recorded_at");
        version.setLimit(1);
        version.query();
        if (!version.next())
            return;

        var version2 = new GlideRecord("sys_update_version");
        version2.addQuery("name", metadata.sys_update_name);
        version2.addQuery("sys_created_on", "<", test_result.sys_created_on);
        // TODO: check if this is needed in STRY58998827
        // qc.addOrCondition("state", "uncustomized");

        version2.orderByDesc("sys_recorded_at");
        version2.setLimit(1);
        version2.query();
        if (!version2.next())
            return;

        var toReturnJsonObject = {
            version1SysId: version.getUniqueValue(),
            version2SysId: version2.getUniqueValue()
        };

        return JSON.stringify(toReturnJsonObject);
    },

    /**
     * Create a report of the tracing differences
     */
    getTracingTestResultDifferences: function(testResultIds) {
        if (!testResultIds)
            return "";

        var testResultIdsInArr = testResultIds.split(",");
        var gr1 = new GlideRecord('sys_atf_test_result');
        if (!gr1.get(testResultIdsInArr[0]))
            return;

        var gdt1 = new GlideDateTime();
        gdt1.setDisplayValue(gr1.getValue('sys_created_on'));

        var gr2 = new GlideRecord('sys_atf_test_result');
        if (!gr2.get(testResultIdsInArr[1]))
            return;

        var gdt2 = new GlideDateTime();
        gdt2.setDisplayValue(gr2.getValue('sys_created_on'));


        var newer = gdt1.getNumericValue() > gdt2.getNumericValue() ? gr1 : gr2;
        var older = gdt1.getNumericValue() < gdt2.getNumericValue() ? gr1 : gr2;
       
        sn_atf.TracedMetadataChangeFinder.findChanges(newer, older);

        return newer.getUniqueValue();
    },

    /**
     * Create a report of the tracing differences
     */
    getTrackerId: function() {
        var sysId = this.getParameter('sysparam_sys_id');
        var trackerId = sn_atf.MetadataTracingUtil.getTrackerByTestResult(sysId);
        return trackerId;
    },

    type: 'ATFTracingHelperAjax'
});
