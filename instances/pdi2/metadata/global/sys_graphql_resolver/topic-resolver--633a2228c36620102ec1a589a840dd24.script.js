(function process( /*ResolverEnvironment*/ env) {
	
    var taxonomyId = env.getArguments().taxonomyId;
    var result = null;
    if (taxonomyId)
        result = new global.TaxonomyUtil().getTopicsHierarchy(taxonomyId);
    return result == null ? [] : result;

})(env);
