var ParallelTestDisplayMessages = Class.create();
ParallelTestDisplayMessages.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	isTestGenRunning: function() {
		var gr = new GlideRecordSecure("sn_atf_tg_sn_boq");
		gr.addQuery("job_qualified_name", "@dotwalk/atf-bootstrap/TestGenerationSNBOQJob");
		gr.addQuery("state", "processing").addOrCondition("state", "browsers_requested").addOrCondition("state", "running").addOrCondition('state', 'processing_started');
		gr.query();
		return gr.hasNext();
	},

    type: 'ParallelTestDisplayMessages'
});
