var aisEnabled = $sp.isAISearchEnabled();

if (aisEnabled) {
    options['utterancePlacement'] = 'body';
    options['placement'] = 'dynamic-landing';
	data.typeAheadSearch = $sp.getWidget('typeahead-search', options);
} else
	data.typeAheadSearch = $sp.getWidget('typeahead-search', options.typeahead_search);
