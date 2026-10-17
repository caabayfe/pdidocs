(function refineQuery(current, parent) {

	var transformer = new TransformMapRelatedLists();
    current.addEncodedQuery(transformer.getUnusedCoalesceFieldsForEmptyValues(parent));

})(current, parent);
