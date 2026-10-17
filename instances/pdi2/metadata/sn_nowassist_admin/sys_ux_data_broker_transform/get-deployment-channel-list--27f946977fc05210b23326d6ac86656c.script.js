function transform(input) {
      try {
        if(gs.nil(input.filterId)){
          return [];
        }
        var result = [];
        var nowAssistGuardianFilterUtil = new sn_nowassist_admin.NowAssistGuardianFilterUtil();
        result = nowAssistGuardianFilterUtil.getVADeploymentChannels(input.filterId);
        
        return result;

      } catch (e) {
        gs.error('NowAssistSkillConfig: Unable to fetch skill virtual Agent for filters: ' + e.toString());
        return [];
      }

}
