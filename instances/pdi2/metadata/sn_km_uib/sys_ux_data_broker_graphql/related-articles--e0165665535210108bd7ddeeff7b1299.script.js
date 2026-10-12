(function buildQuery(query, inputs) {
    var qb = new GraphQLQueryBuilder(query, inputs);

    return qb;
})(query, inputs);
