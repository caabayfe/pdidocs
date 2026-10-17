function deleteSet() {
	
	var modal = new GlideModal("delete_semaphore_set");
	modal.setTitle("Delete Semaphore Set");
	modal.setPreference('onPromptComplete', _deleteSemaphoreSet);
	modal.render();
	
	function _deleteSemaphoreSet(semSetId) {
		var ga = new GlideAjax('global.DeleteSemaphoreSetAjax'); //script include
		ga.addParam('sysparm_name', 'deleteSemaphoreSet');
		ga.addParam('sysparm_sem_set_id', semSetId);
		ga.getXMLWait();
		ga.getAnswer();
	}
}
