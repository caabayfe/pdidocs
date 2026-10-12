var answer = true;

var changeRequest = new ChangeRequest(current);

if (!changeRequest.isNew())
	answer = false;
