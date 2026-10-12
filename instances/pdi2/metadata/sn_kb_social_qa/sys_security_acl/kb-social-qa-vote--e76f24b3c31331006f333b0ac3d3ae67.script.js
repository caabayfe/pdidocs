if(gs.nil(current.reference_name) && gs.nil(current.reference_id) || current.operation()=='insert')
	answer = true;
else
	answer = new SocialQACommon().canCreateVoteorComment(current.reference_name, current.reference_id);
