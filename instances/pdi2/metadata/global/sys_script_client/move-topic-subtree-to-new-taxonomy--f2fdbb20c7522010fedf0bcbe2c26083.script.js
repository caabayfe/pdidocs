
var gFormAlreadySubmitted = false;
g_scratchpad.formSubmissionInProgress = false;

function onSubmit() {

    if (gFormAlreadySubmitted || (!g_form.getControl('taxonomy').changed && !g_form.getControl('parent_topic').changed) || g_form.isNewRecord()) {
        return true;
    }

    var topic = g_form.getUniqueValue();
    var topicName = g_form.getValue('name');
    var newTaxomomy = g_form.getValue('taxonomy');
    var topicState = g_form.getValue('active');
    var parentTopic = g_form.getValue('parent_topic');

    var titleText = getMessage("Move Topic {0}");
    titleText = titleText.withValues([topicName]);

    var moveObj = {
        title: titleText,
        body: getMessage("Moving a topic will move all its child topics and content associated with this topic. Do you want to continue?"),
        buttonLabelComplete: getMessage('Move'),
        buttonClassComplete: 'btn-primary',
        buttonLabelCancel: getMessage('Cancel'),
        onPromptComplete: MoveTopicTree,
        onPromptCancel: function() {}
    };

    showDialog(moveObj);

    function showDialog(obj) {
        var dialog = new GlideModal('glide_modal_confirm', false, 400);
        dialog.setTitle(obj.title);
        dialog.setPreference('body', obj.body);
        dialog.setPreference('buttonClassComplete', obj.buttonClassComplete);
        dialog.setPreference('buttonLabelComplete', obj.buttonLabelComplete);
        dialog.setPreference('buttonLabelCancel', obj.buttonLabelCancel);
        dialog.setPreference('onPromptComplete', obj.onPromptComplete);
        dialog.setPreference('onPromptCancel', obj.onPromptCancel);
        dialog.render();
    }

    function MoveTopicTree() {
        // initialize the flag to prevent parent topic field from being cleared while form is submitted
        g_scratchpad.formSubmissionInProgress = true;
        var ajax = new GlideAjax('TopicList');
        ajax.addParam('sysparm_name', 'moveTopicTree');
        ajax.addParam('sysparm_isTaxonomyChanged', g_form.getControl('topic.taxonomy').changed);
        ajax.addParam('sysparm_isActiveToggled', g_form.getControl('active').changed);
        ajax.addParam('sysparm_topicSysId', topic);
        ajax.addParam('sysparm_parentTopicId', parentTopic);
        ajax.addParam('sysparm_taxomomySysId', newTaxomomy);
        ajax.addParam('sysparm_topicState', topicState);
        ajax.addParam('sysparm_topicEnableUserCriteria', g_form.getValue('enable_user_criteria_check'));
        ajax.getXMLAnswer(function(answer) {
            g_form.setValue('active', answer);
            completeSubmit();
            return true;
        });
    }

    function completeSubmit() {
        // reset the flag after form is submitted
        g_scratchpad.formSubmissionInProgress = false;
        gFormAlreadySubmitted = true;
        gsftSubmit(undefined, undefined, g_form.getActionName());
    }

    return false;
}
