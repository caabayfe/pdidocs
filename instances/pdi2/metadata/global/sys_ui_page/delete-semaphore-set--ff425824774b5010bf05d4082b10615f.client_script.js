function deleteSemSet() {
	
	var semSetId = gel('selected_id').value;
	var semSetsInUse = gel('sem_sets_in_use').value;
	
	if (semSetsInUse.indexOf(semSetId) > -1) {
		showInlineError(new GwtMessage().getMessage('Please select a semaphore set that is not in use. If you wish to delete the set, first change the Semaphore Set Id of all Node Types using this set.'));
		
		//Add error message text to hidden aria element for accessibility
		var ariaElement = document.getElementById('live-aria-1');
		ariaElement.innerHTML = '${JS:gs.getMessage("Please select a semaphore set that is not in use. If you wish to delete the set, first change the Semaphore Set Id of all Node Types using this set.")}';
		return;
	}
	
	var gm = GlideModal.get();
	var processFunction = gm.getPreference('onPromptComplete');
    if (typeof (processFunction) === 'function') {
		try {
			processFunction(semSetId);
		} catch (e) {
		}
	}
	//Close the window
	GlideModal.get().destroy();
	return true;
}

function showInlineError(message) {
    gel("errorMessageBlock").style.display = "block";
    gel("error").innerHTML = " " + message;
}
