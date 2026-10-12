/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  
  if(api.data){
    let pluginStatus = api.data.now_assist_summary_plugin_status_transform_1;
    let pluginStatusOutput = {};
    let activePlugins = 0;
    let inactivePlugins=0;
    let totalPlugins = 0;
    if(pluginStatus){
      pluginStatusOutput = pluginStatus.output[0];
      if(pluginStatusOutput){
        activePlugins = parseInt(pluginStatusOutput.data[0].value);
        if(pluginStatusOutput.data[1]){
          inactivePlugins = parseInt(pluginStatusOutput.data[1].value);
        }
        totalPlugins = activePlugins+inactivePlugins;
      }
     
    }
    let skillStatus = api.data.now_assist_summary_skill_status_transform_1;
    let skillStatusOutput = {};
    let notConfiguredSkills = 0;
    let draftSkills = 0;
    let inactiveSkills = 0;
    let activeSkills = 0;
    let totalSkills = 0;
    if(skillStatus){
      skillStatusOutput = skillStatus.output[0];
      if(skillStatusOutput){
          notConfiguredSkills = parseInt(skillStatusOutput.data[0].value);
          draftSkills = parseInt(skillStatusOutput.data[1].value);
          inactiveSkills = parseInt(skillStatusOutput.data[2].value);
          activeSkills = parseInt(skillStatusOutput.data[3].value);
          totalSkills = notConfiguredSkills+inactiveSkills+activeSkills+draftSkills;
      }
    }
    if(activePlugins == totalPlugins || (activePlugins*4>=totalPlugins*3 && activeSkills*4>=totalSkills*3)){
        return true;
      }else{
        return false;
      }
  }

}
