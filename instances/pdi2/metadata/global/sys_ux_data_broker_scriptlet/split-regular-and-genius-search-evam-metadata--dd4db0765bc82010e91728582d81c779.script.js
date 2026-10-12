function transform(input) {
	var metadata = input
		.graphqlData
		.data
		.GlideCompositeDataMetadata_Query
		.getMetadata;
	if (!metadata) {
		return {};
	}
	
	var geniusSearchDataSources =
		metadata
			.datasources
			.filter(function(source) {
				return source.table === 'v_search_genius_result';
			});
	var regularSearchPredicates = [];
	var geniusSearchPredicates = [];
	
	metadata
		.template_predicates
		.forEach(function(predicate) {
			if (predicate.table === 'v_search_genius_result') {
				geniusSearchPredicates.push(predicate);
			} else {
				regularSearchPredicates.push(predicate);
			}
		});
	
	return {
		regularSearchEvamMetadata: {
			datasources: [],
			template_predicates: regularSearchPredicates,
			filters: []
		},
		geniusSearchEvamMetadata: {
			datasources: geniusSearchDataSources,
			template_predicates: geniusSearchPredicates,
			filters: []
		}
	};
}
