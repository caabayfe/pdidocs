function process(context) {
	var answer = new sn_ais.GeniusResultAnswer();

	var searchPhrase = context.getOriginalSearchPhrase();
	answer.setSearchPhrase(searchPhrase);
	answer.snippetSearch(true);

	return answer;
}
