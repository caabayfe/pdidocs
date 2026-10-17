(function refineQuery(current, parent) {

	var transformer = new TransformMapRelatedLists();
    current.addEncodedQuery(transformer.getUnindexedReferenceFields(parent));

})(current, parent);
