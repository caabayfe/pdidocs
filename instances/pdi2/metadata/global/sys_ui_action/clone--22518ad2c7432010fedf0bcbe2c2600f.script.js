function copyTopicTree() {
    dialog = new GlideModal('copy_topic_tree');
    dialog.setTitle(getMessage("Select a destination taxonomy and parent topic"));
    dialog.setPreference('currentParentTopic', g_form.getValue('parent_topic'));
    dialog.setPreference('currentTaxonomy', g_form.getValue('taxonomy'));
    dialog.setPreference('onPromptComplete', confirm);
    dialog.setPreference('onPromptCancel', cancel);
    dialog.setPreference('focusTrap', true);
    dialog.setWidth(400);
    dialog.render();
}

function confirm() {
    var ga = new GlideAjax('TopicList');
    ga.addParam('sysparm_name', 'copyTopicTree');
    ga.addParam('sysparm_currentTopicId', g_form.getUniqueValue());
    ga.addParam('sysparm_newTaxonomyId', $j("#taxonomyField").val());
    ga.addParam('sysparm_newParentTopicId', $j("#topicField").val());
    ga.getXML(responseParse);
}

function cancel() {
    return false;
}

function responseParse(response) {
    if (response) {
        var result = response.responseXML.documentElement.getAttribute("answer");
        if (result.length > 0) {
            var newTopicId = result;
            var redirectionId = newTopicId ? newTopicId : g_form.getUniqueValue();
            var redirectUrl = "topic.do?sys_id=" + redirectionId;
            g_navigation.open(redirectUrl);
        } else
            g_form.addErrorMessage("Error copying taxonomy, Please refer logs");
    }
}
