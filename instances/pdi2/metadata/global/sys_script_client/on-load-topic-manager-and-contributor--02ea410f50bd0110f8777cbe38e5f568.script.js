function onLoad() {
      var ga = new GlideAjax('global.TopicPermissionClientUtil');
      if (g_form.newRecord) {
        ga.addParam('sysparm_name', 'getParentTopicManagerAndContributor');
        var parentTopicSysId = g_form.getValue('parent_topic');
        if (parentTopicSysId) {
          ga.addParam('sysparm_parentTopicSysId', parentTopicSysId);
          ga.getXML(getResponse);
        }
      } else {
        ga.addParam('sysparm_name', 'isTaxonomyAdminOrManager');
        var taxonomySysId = g_form.getValue('taxonomy');
        if (taxonomySysId) {
          ga.addParam('sysparm_taxonomySysId', taxonomySysId);
          ga.getXML(function(response) {
            response = response.responseXML.documentElement.getAttribute('answer') || "false";
            var result = JSON.parse(response);
            if (!result) {
              g_form.setDisabled("topic_manager", true);
              g_form.setDisabled("topic_contributor", true);
            }
          });
        }
      }
      
      function getResponse(response) {
        var result = response.responseXML.documentElement.getAttribute('answer');
        if (result) {
          result = JSON.parse(result);
          g_form.setValue('topic_manager', result.topic_manager);
          g_form.setValue('topic_contributor', result.topic_contributor);
          g_form.setDisabled("topic_manager", true);
          g_form.setDisabled("topic_contributor", true);
        }
      }
    }
  
