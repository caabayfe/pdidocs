function transform(input) {
	var metadata = input.regularSearchEvamMetadata;
	
	var searchResults = input.searchData.searchResults;
	
	if (!metadata) {
		return {
			data: searchResults,
			template_predicates: []
		};
	}

	metadata.template_predicates.forEach(function(predicate) {
		if (predicate.fields)
			predicate.fields.push('ais_doc_id');	
	});

	return {
		data: searchResults,
		template_predicates: metadata.template_predicates
	};
}
