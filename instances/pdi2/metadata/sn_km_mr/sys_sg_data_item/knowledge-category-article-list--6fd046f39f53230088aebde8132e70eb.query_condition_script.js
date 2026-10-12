(function getQueryString(input) {
	//Type appropriate comment here, and begin script below
	var queryString =  new global.KBKnowledge().getKnowledgeEncodedQuery("mesp");
	queryString+="^kb_category="+(input.category_id || "")+"^EQ^ORDERBYshort_description";
	return queryString; 
})(input);
