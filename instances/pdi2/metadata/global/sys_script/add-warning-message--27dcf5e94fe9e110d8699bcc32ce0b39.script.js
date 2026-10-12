(function executeRule(current, previous /*null when async*/ ) {
    var WARNING_THRESHOLD = 3;
    var multilingualGa = new GlideAggregate("ais_country_to_search_language");
    multilingualGa.addAggregate('COUNT', 'country');
    multilingualGa.addQuery('country', current.country);
    multilingualGa.query();
    if (multilingualGa.next()) {
        var row_count = multilingualGa.getAggregate('COUNT', 'country');
        if (row_count >= WARNING_THRESHOLD) {
            gs.addInfoMessage(gs.getMessage("'{0}' has {1} country to language mappings. Mapping multiple search languages to a single country expands the search scope for each query. Test to make sure your mappings don't impact performance for the search experience.", [current.country.name, row_count]));
        }
    }
})(current, previous);
