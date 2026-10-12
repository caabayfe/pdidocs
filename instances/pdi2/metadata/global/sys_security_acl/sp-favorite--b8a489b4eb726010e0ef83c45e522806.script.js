answer = exectue();

function execute() {
	if (current.operation() == 'insert')
		return true;
	
	if (current.getValue('user') == gs.getUserID())
		return true;
	
	return false;
}
