(function executeRule(current, previous /*null when async*/) {

	if(!current.article.nil() && !current.article.summary.nil())
		current.article_summary = current.article.summary;

})(current, previous);
