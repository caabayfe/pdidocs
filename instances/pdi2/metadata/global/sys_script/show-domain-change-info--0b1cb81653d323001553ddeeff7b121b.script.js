(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var item = sc_ic_Factory.wrap(current);
	
	if (!item.accessibleInDomain())
		gs.addInfoMessage(gs.getMessage("This item has been published in another domain."));


})(current, previous);
