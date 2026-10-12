function transform(input) {
    var sourceTable = input && input.source_table;
    var searchString = input && input.search_string;
    var currentElementById = input && input.currentElementById;
    var additionalQuery = input && input.additionalQuery;
    var query = "nameLIKE" + searchString;
    var util = new sn_vsc.SCTypeAheadUtil();
    // If there is an additional query from the client, add it and send over to the util
    if (additionalQuery) {
        query += "^" + additionalQuery;
    }
    return util.filterOptions(sourceTable, currentElementById, query);
}
