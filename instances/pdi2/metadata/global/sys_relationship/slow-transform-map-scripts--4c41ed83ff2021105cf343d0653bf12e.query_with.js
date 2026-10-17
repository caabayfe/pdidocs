(function refineQuery(current, parent) {

    var transformer = new TransformMapRelatedLists();
    current.addEncodedQuery(transformer.getSlowScriptQuery(parent) + '^stack_traceLIKEtransformAllMaps');

})(current, parent);
