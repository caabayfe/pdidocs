var AJAXUnreferencedPreviewWorker = Class.create();
AJAXUnreferencedPreviewWorker.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	start: function() {
		// Setup background worker
		var worker = new GlideUnreferencedPreviewWorker();
		worker.setRuleId(this.getParameter('sysparm_ajax_processor_rule_id'));
		worker.setProgressName("Finding sample of unreferenced records");

		// Start worker in the background
		worker.setBackground(true);
		worker.start();
		
		// Return worker progress ID to caller
		var progressId = worker.getProgressID();
		return progressId;	
	},
	
    type: 'AJAXUnreferencedPreviewWorker'
});
