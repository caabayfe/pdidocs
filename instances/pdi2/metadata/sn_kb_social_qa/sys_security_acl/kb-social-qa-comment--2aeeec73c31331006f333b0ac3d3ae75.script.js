answer = execute();

function execute() {
    if (gs.nil(current.content)) {
        if ((gs.nil(current.reference_name) && gs.nil(current.reference_id)) || current.operation() == 'insert')
            return true;
        return new SocialQACommon().canReadVoteorComment(current.reference_name, current.reference_id);
    }
	return false;
}
