(function process( /*ResolverEnvironment*/ env) {
    var result = new global.TaxonomyUtil().getTaxonomies(false);
    return result == null ? [] : result;
	
})(env);
