function onLoad() {
    //Hide form fields if template field not present in API
    var ga = new GlideAjax('TopicTemplateUtilSNC');
    ga.addParam('sysparm_name', 'templateFieldExists');
    ga.getXML(getResponse);
    
    //Set Parent or Default Template
    if(!g_form.getValue('template')){
      var gaTemplate = new GlideAjax('TopicTemplateUtilSNC');
      gaTemplate.addParam('sysparm_name', 'getApproriateTemplate');
      gaTemplate.addParam('sysparm_topic_sys_id', g_form.getValue('parent_topic'));
      gaTemplate.getXML(setApproriateTemplate);
    }
    }
    function getResponse(serverResponse) {
      var result = serverResponse.responseXML.documentElement.getAttribute('answer') === 'true';
      if(!result){
        g_form.setMandatory('template', false);
        g_form.setVisible('template', false);
        g_form.setVisible('apply_to_child_topics',false);
      }
    }

    function setApproriateTemplate(serverResponse){
      var result = serverResponse.responseXML.documentElement.getAttribute('answer');
      if(result != null)
        g_form.setValue('template',result);
    }
