function transform(input){
	if(gs.nil(input) || gs.nil(input.temporarySysId) || gs.nil(input.articleId))
		return false;

	return new global.KBKnowledge().updateTemporarySysId(input.temporarySysId, input.articleId);
}
