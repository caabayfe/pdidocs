(function executeRule(current, previous /*null when async*/) {

	try {	
		if(RP){
			var loadMoreErrorMsg = RP.getParameterValue("LoadMoreErrorMsg");

			if(loadMoreErrorMsg && loadMoreErrorMsg !== ""){
				gs.addErrorMessage(loadMoreErrorMsg);
			}
		}
    } catch (e) {
        //ignore error
    }
})(current, previous);
