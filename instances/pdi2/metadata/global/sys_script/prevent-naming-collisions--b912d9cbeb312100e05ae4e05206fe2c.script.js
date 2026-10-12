handleNamingCollisions();

function handleNamingCollisions() {
	var changesTo = current;
	var changesFrom = current.operation() == 'update' ? previous : null;
	
	var msg = (new LabelCollision()).validateAndProcessChange(changesFrom, changesTo);
	
	// no collision, we are done
	if (msg == 'OK')
		return;
		
	// a collision occured. display details and abort action
	gs.addErrorMessage(msg);
	current.setAbortAction(true);
}
