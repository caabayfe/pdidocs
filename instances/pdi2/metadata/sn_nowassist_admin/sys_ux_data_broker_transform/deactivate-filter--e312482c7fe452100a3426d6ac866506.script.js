function transform(input) {
   
    var filterId = input.deactivatonFilterId;
    try {
        if(gs.nil(filterId)){
          return null;
        }
        var nowAssistGuardianFilterUtil = new sn_nowassist_admin.NowAssistGuardianFilterUtil();
        return nowAssistGuardianFilterUtil.changeFilterStatus(filterId, false);      
        
    } catch (e) {
        gs.error("Failed fetch Sensitive Filter - " + e.toString());
        return null;
    }

}
