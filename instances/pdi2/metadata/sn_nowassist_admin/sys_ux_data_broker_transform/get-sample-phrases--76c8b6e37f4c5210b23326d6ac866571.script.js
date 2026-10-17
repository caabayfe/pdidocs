function transform(input) {
   
	var filterId = input.filterId;
   
	try {
    if(gs.nil(filterId)){
          return null;
    }
        
    var nowAssistGuardianFilterUtil = new sn_nowassist_admin.NowAssistGuardianFilterUtil();
		var result = [];
		result = nowAssistGuardianFilterUtil.getSamplePhrasesByFilterId(filterId);
		for(var i=0;i<result.length;i++){
			result[i].isEdit = false;
		}
		
    return {samplePhrases: result};
    } catch (e) {
      gs.error("Failed to fetch Sample Phrases - " + e.toString());
      return null;
    }
	
}
