answer = execute();

function execute() {
	if (gs.nil(current.content)) {
		return new SocialQACommon().canEditComment(current);
	}
	return false;
}
