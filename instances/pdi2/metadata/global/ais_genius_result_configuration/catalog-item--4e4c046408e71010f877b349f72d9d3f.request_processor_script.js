function process(context) {
	var answer = new sn_ais.GeniusResultAnswer();

	answer.setTable('sc_cat_item');
	answer.setSearchPhrase(context.getOriginalSearchPhrase());
	answer.setEncodedQuery("sys_class_name!=std_change_record_producer");
	answer.setSearchLimit(3);
	answer.searchTitleOnly(true);
	answer.addSearchAttribute("geniusResultSearchMode", ["custom"]);

	return answer;
}
