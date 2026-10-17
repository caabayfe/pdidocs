(function executeRule(current, previous /*null when async*/) {

	new SNC.DynCategoryRefFieldCreator().addFieldForTableCreate(current.name);

})(current, previous);
