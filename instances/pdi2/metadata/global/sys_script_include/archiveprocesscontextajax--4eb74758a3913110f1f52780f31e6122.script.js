var ArchiveProcessContextAjax = Class.create();
ArchiveProcessContextAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	archiveProcessContexts: function() {
		var contextIds = this.getParameter('sysparm_selectedProcesses');
		var processService = new PDProcessService();

		processService.archiveProcessContexts(contextIds);
	},
    type: 'ArchiveProcessContextAjax'
});
