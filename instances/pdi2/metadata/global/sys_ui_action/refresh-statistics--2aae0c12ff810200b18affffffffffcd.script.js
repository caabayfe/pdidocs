(function execute(current) {

	var util = new StdChangeUtils();
	util.calculateVersionAndTemplateStats(current.getUniqueValue());
	action.setRedirectURL(current);

})(current);
