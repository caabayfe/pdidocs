var DeleteSemaphoreSetAjax = Class.create();
DeleteSemaphoreSetAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	deleteSemaphoreSet: function() {
		if (!gs.hasRole("maint")) {
			gs.addErrorMessage(gs.getMessage("Access denied to delete Semaphore Set"));
			return;
		}
		
		var semSetId = this.getParameter('sysparm_sem_set_id');
		var gr = new GlideRecord("sys_semaphore_set");
		gr.addQuery("semaphore_set_id", semSetId);
		gr.deleteMultiple();
		gs.addInfoMessage(gs.getMessage("Successfully removed semaphore set with ID {0}. Please refresh list to view updated records.", semSetId));
		return true;
	},
	
    type: 'DeleteSemaphoreSetAjax'
});
