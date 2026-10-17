(function getQueryString(input) {
	var encodedQuery = new global.KBKnowledge().getKnowledgeEncodedQuery("mesp");
	encodedQuery+="^sys_view_count>0^ORDERBYDESCsys_view_count";
	return encodedQuery; 
})(input);
