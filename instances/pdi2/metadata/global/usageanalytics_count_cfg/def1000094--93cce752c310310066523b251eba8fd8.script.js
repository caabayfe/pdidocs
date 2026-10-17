answer = getUniqueItemsOrdered();

function getUniqueItemsOrdered() {
	if (!GlideTableDescriptor.isValid('sc_req_item'))
		return 0;
	var ga = new GlideAggregate('sc_req_item');
	ga.groupBy('cat_item');
	ga.addAggregate('COUNT', 'cat_item');
	ga.query();
	return ga.getRowCount();
}
