/*
 *  Notes: This identifier will go through the table specified in applies_to field of the identifier
 *         and match based on name field of the CI. 
 *
 *  Warning: This could potentially cause reclassification since it does not check for the CI class (sys_class_name).
 */

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
        gr.addQuery('name', discoveredName);
        gr.query();
        
        // populate our return value...
        while (gr.next())
            matches.push('' + gr.getUniqueValue());

        return matches;
    }
}
