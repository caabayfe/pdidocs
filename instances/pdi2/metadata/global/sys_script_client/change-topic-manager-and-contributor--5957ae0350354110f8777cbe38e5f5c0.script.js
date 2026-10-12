function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }
    
    if (g_form.newRecord) {
        var ga = new GlideAjax('global.TopicPermissionClientUtil');
        ga.addParam('sysparm_name', 'getParentTopicManagerAndContributor');
        var parentTopicSysId = newValue;
        if (parentTopicSysId) {
            ga.addParam('sysparm_parentTopicSysId', parentTopicSysId);
            ga.getXML(getResponse);
            g_form.setDisabled("topic_manager", true);
            g_form.setDisabled("topic_contributor", true);
        }
    }

    function getResponse(response) {
        var result = response.responseXML.documentElement.getAttribute('answer');
        if (result) {
            result = JSON.parse(result);
            g_form.setValue('topic_manager', result.topic_manager);
            g_form.setValue('topic_contributor', result.topic_contributor);
        }
    }    
}
