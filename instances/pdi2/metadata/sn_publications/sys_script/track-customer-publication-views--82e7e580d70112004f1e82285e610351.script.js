(function executeRule(current, previous /*null when async*/) {
	new PublicationsApi().trackCustomerViewArticle(gs.getUserID(), current.getUniqueValue());
})(current, previous);
