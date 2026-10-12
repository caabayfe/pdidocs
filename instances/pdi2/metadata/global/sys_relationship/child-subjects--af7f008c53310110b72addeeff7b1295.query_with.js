(function refineQuery(current, parent) {

	current.addQuery("parent", parent.getUniqueValue());
	current.orderBy("subject_name");

})(current, parent);
