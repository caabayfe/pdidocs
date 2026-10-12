if (current.name.toLowerCase() == 'default') {
	gs.addErrorMessage(gs.getMessage('You cannot delete Default semaphore.'));
	current.setAbortAction(true);
}

if (current.name.toLowerCase() == 'workerthread') {
	gs.addErrorMessage(gs.getMessage('You cannot delete WorkerThread semaphore.'));
	current.setAbortAction(true);
}
