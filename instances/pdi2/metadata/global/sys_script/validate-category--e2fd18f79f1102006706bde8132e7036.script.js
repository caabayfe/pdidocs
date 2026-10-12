(function executeRule(current, previous /*undefined when async or display*/ ) {

	if (JSUtil.notNil(current.catalog) && JSUtil.notNil(current.category)) {
		if (current.catalog.indexOf(GlideappCategory.get(current.category).getCatalog()) ==
			-1) {
			gs.addErrorMessage(gs.getMessage(
				'You cannot select Category "{0}" because it does not exist in the selected Catalog',
				current.category.title));
			current.setAbortAction(true);
		}
	}

})(current, typeof previous != 'undefined' ? previous : null);
