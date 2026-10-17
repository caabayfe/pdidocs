var generalSettingObj = {};
var predecessorGr = new GlideRecord('sys_script_fix');
predecessorGr.addQuery('sys_id', 'be909a87c7b91010fd68220eb4c2607b');
predecessorGr.query();
var alreadyRan = predecessorGr.next();

var gr;
if (!alreadyRan) {
  gr = new GlideRecord('sys_cs_general_settings');
  gr.addQuery('sys_domain', '=', 'global');
  gr.setLimit(1);
  gr.query();
  while (gr.next()) {
    var generalSetting = {
      greeting: gr.getValue('welcome_topic'),
      survey: gr.getValue('survey_topic'),
      live_agent: gr.getValue('live_agent_topic'),
      explore_help: gr.getValue('explore_help_topic'),
      error: gr.getValue('error_topic'),
      closing: gr.getValue('closing_topic'),
      fallback: gr.getValue('fallback_topic'),
      anything_else: gr.getValue('anything_else_topic')
    };
    updateContextProfileTopicForGlobal(generalSetting);
  }

  var grDomain = new GlideRecord('sys_cs_general_settings');
  grDomain.addQuery('sys_domain', '!=', 'global');
  grDomain.query();
  while (grDomain.next()) {
    var generalSettingDomain = {
      greeting: grDomain.getValue('welcome_topic'),
      survey: grDomain.getValue('survey_topic'),
      live_agent: grDomain.getValue('live_agent_topic'),
      explore_help: grDomain.getValue('explore_help_topic'),
      error: grDomain.getValue('error_topic'),
      closing: grDomain.getValue('closing_topic'),
      fallback: grDomain.getValue('fallback_topic'),
      anything_else: grDomain.getValue('anything_else_topic')
    };
    var sysDomain = grDomain.getValue('sys_domain');
    var keys = Object.keys(generalSettingDomain);
      keys.forEach(function(key, index) {
        insertContextProfileTopic(sysDomain, key, generalSettingDomain[key]);
      });
  }
}

//temporarily disable the data policy on the "active' flag
gr = new GlideRecord('sys_data_policy2');
gr.get('3757909353651010a813ddeeff7b1222');
gr.setValue('active', false);
gr.update();
//set the default sys_cs_context_profile record active flag to true
gr = new GlideRecord('sys_cs_context_profile');
gr.get('3a33973653211010a813ddeeff7b125a');
gr.setValue('active', true);
gr.update();
//reactivate the data policy on the active flag
gr = new GlideRecord('sys_data_policy2');
gr.get('3757909353651010a813ddeeff7b1222');
gr.setValue('active', true);
gr.update();

function updateContextProfileTopicForGlobal(generalSetting) {
  var grpt = new GlideRecord('sys_cs_context_profile_topic');
  grpt.addQuery('context_profile', '3a33973653211010a813ddeeff7b125a');
  grpt.query();
  while (grpt.next()) {
      var topicType = grpt.getValue('topic_type');
      var sysId = grpt.getValue('sys_id');
      generalSettingObj[topicType] = sysId;
      if (generalSetting[topicType]) {
          grpt.setValue('topic', generalSetting[topicType]);
      }
      else if (GlideStringUtil.nil(grpt.getValue('topic'))) {
          grpt.setValue('topic', 'NULL');
      }
      grpt.update();
  }
}

function insertContextProfileTopic(domain, gsKey, gsValue) {
  var grptDomain = new GlideRecord('sys_cs_context_profile_topic');
  grptDomain.initialize();
  grptDomain.topic_type = gsKey;
  grptDomain.topic = gsValue;
  grptDomain.context_profile = '3a33973653211010a813ddeeff7b125a';
  grptDomain.sys_domain = domain;
  grptDomain.sys_overrides = generalSettingObj[gsKey];
  grptDomain.insert();
}
