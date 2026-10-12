var ATFPerformanceClientUtil = Class.create();
ATFPerformanceClientUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getOrCreateComparisonUrl: function() {
        var result = {
            error: null,
            link: null
        };

        var run1 = this.getParameter('sysparm_run_1');
        var run2 = this.getParameter('sysparm_run_2');
        var allowDuplicateComparisons = gs.getProperty('sn_atf.performance.allow_duplicate_comparison_creation') === "true";

        if (JSUtil.nil(run1) || JSUtil.nil(run2)) {
            result.error = gs.getMessage('ATF:comparison_generation_nil_error');
            return JSON.stringify(result);
        }
        if (!sn_atf.PerformanceAPI.canCompare(run1, run2)) {
            result.error = gs.getMessage('ATF:comparison_generation_invalid_error');
            return JSON.stringify(result);
        }

        var gr = new GlideRecordSecure('sys_atf_performance_compare');
        gr.addQuery('run1', run1);
        gr.addQuery('run2', run2);
        gr.query();

        if (gr.next() && !allowDuplicateComparisons) {
            result.link = gr.getLink();
        } else {
            gr = new GlideRecordSecure('sys_atf_performance_compare');
            gr.initialize();
            gr.setValue('run1', run1);
            gr.setValue('run2', run2);
            gr.insert();
            result.link = gr.getLink();
        }

        return JSON.stringify(result);
    },
    type: 'ATFPerformanceClientUtil'
});
