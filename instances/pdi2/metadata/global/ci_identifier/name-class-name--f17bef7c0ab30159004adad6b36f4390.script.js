function(ciData, log, identifier) { 
    var discoveredName = ciData.getData().name;
    var matchable = JSUtil.notNil(discoveredName);
	var matching = [];
	
	if (matchable)
		matching = matchingCIs(discoveredName, ciData);
	
	return new CIIdentifierResult(matching, matchable);
	    
    function matchingCIs(discoveredName, ciData) {
        var matches = [];

        // find all the matches by name...
        var gr = new GlideRecord(identifier.applies_to);
        gr.addQuery('sys_class_name', ciData.getData().sys_class_name);
        gr.addQuery('name', discoveredName);
        gr.query();
        
        // populate our return value...
        while (gr.next())
            matches.push('' + gr.getUniqueValue());

        return matches;
    }
}
