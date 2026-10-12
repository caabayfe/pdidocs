var ScopedCleanGlideQueryExecutor = Class.create();
ScopedCleanGlideQueryExecutor.prototype = {
    cleanQuery: function(table, query) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		var notSupportedOperators = ["SAMEAS", "NSAMEAS", "GT_FIELD", "LT_FIELD", "GT_OR_EQUALS_FIELD", "LT_OR_EQUALS_FIELD", "DYNAMIC", "MORETHAN", "LESSTHAN", "DATEPART", "RELATIVE"];
		var regexPattern = "\\^NQ(?!\\^)"; // Match ^NQ not followed by ^
		var regex = new RegExp(regexPattern, 'g'); // 'g' flag for global matching
		var newQuery = "";
		if (query.contains("^NQ")) {
			query = query.split(regex)[0];
		}

		var gqs = new GlideQueryString(table, query);
		gqs.deserialize();
		var termIterator = gqs.getTerms().iterator();
		while (termIterator.hasNext()) {
			var term = termIterator.next();
			// Once we get the first field, we don't care about the next OR field since 1 OR 0 = 1
			if(term.isOR())
				continue;
			
			if (notSupportedOperators.includes(term.getOperator()))
				return "";

			newQuery = newQuery + term.getTermField() + term.getOperator() + term.getValue();
			newQuery = newQuery + "^";
		}
		
		if (newQuery == "") {
			return "";
		}
		//Removing the extra "^"
		var pos = newQuery.lastIndexOf('^');
		newQuery = newQuery.substring(0,pos) + newQuery.substring(pos+1);
		return newQuery;
    },


    type: 'ScopedCleanGlideQueryExecutor'
};
