(function executeRule(current, previous /*null when async*/ ) {
    // nothing to do if there's no filter
    if (!current.filter)
        return;

	// parse the filter condition terms
    var gqs = new GlideQueryString(current.table_name, current.filter);
    gqs.deserialize();
    var terms = gqs.getTerms().toArray();

	// check for dotwalks
    for (var i in terms) {
        if (!terms[i].getField().contains('.'))
            continue;

        // stop if we find any filter condition with a dotwalk
        gs.addInfoMessage(gs.getMessage('Dotwalks in filter conditions can negatively impact query performance. Make sure to validate the performance of this Security Data Filter with the performance analysis tool before making it active in production.'));
        break;
    }

	// check for JOIN
    for (var j in terms) {
        if (terms[j].getOperator().toLowerCase() != 'join')
            continue;

        // stop if we find any filter condition with a join
        gs.addInfoMessage(gs.getMessage('Joins in filter conditions can negatively impact query performance. Make sure to validate that performance is acceptable before making this data filter active in production.'));
        break;
    }
})(current, previous);
