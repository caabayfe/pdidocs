answer = execute();

function execute() {
	if (gs.nil(current.content)) { 
		return new SocialQACommon().canEditComment(current);
		//Hard delete is not allowed to user, but in future might open
	}
	return false;
}
