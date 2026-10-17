(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const table = request.body?.data?.table;
    // default to an empty string when it's null or undefined, so that aggregate query calls will work correctly
    const filterQuery = request.body?.data?.filterQuery || '';

    const result = {
        table,
        filterQuery
    };

    if (!table) {
        return result;
    }

    const ga = new GlideAggregate(table);
    ga.addEncodedQuery(filterQuery);
    ga.addAggregate("COUNT");
    ga.query();

    if (ga.next()) {
        result.count = ga.getAggregate("COUNT");
    }

    return result;

})(request, response);
