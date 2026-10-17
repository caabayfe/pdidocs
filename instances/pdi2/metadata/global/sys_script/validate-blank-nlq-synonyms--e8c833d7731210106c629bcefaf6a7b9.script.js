(function executeRule(current, previous /*null when async*/ ) {
    var synonyms = current.synonyms;
    var synlist = synonyms.split(',');

    if (!synlist.every(validSynonym)) {
        gs.addErrorMessage(gs.getMessage("No synonym can be blank or shorter than one character."));
        current.setAbortAction(true);
    }

    function validSynonym(syn) {
		var trimSyn = syn.trim();
        return trimSyn.length > 1 && trimSyn[0] != " ";
    }

})(current, previous);
