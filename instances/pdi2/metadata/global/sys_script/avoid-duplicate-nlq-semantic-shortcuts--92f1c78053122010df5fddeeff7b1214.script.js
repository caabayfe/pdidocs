(function executeRule(current, previous /*null when async*/) {
	var synonyms = current.synonyms;
    var synlist = synonyms.split(',');
	
	// STRY51868042: check duplicates
	var seen = {};
	var duplicates = [];
	for(var i=0; i< synlist.length; i++){
		var syn = synlist[i].replace(/\s+/g,' ').trim();
		if(syn in seen){
			duplicates.push(synlist[i]);
		}
		else{
			seen[syn]=0;
		}
	}
	if(duplicates.length > 0){
		gs.addErrorMessage(gs.getMessage("Following synonyms already exist: "+duplicates.join()));
		current.setAbortAction(true);
	}

})(current, previous);
