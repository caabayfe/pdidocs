var gFormAlreadySubmitted = false;

function onSubmit(control, oldValue, newValue, isLoading, isTemplate) {
    if (gFormAlreadySubmitted || !g_form.getControl("taxonomy.active").changed || g_form.isNewRecord()) {
        return true;
    }

    var taxonomy = g_form.getUniqueValue();
    var activationObj = {
        title: getMessage('Taxonomy Activation'),
        body: getMessage('Do you want to activate this taxonomy only or all child topics and subtrees associated with this taxonomy?'),
        buttonLabelComplete: getMessage('Complete taxonomy tree'),
        buttonClassComplete: 'btn-primary',
        buttonLabelCancel: getMessage('This taxonomy only'),
        onPromptComplete: ActivateTaxonomyTopics,
        onPromptCancel: completeSubmit
    };
    var deactivationObj = {
        title: getMessage('Taxonomy Deactivation'),
        body: getMessage('Deactivating this taxonomy will deactivate this taxonomy and all child topics and subtrees associated with this taxonomy. %3cbr%3e %3cbr%3e Do you want to continue?'),
        buttonLabelComplete: getMessage('Deactivate'),
        buttonClassComplete: 'btn-danger',
        buttonLabelCancel: getMessage('Cancel'),
        onPromptComplete: DeactivateTaxonomyTopics,
        onPromptCancel: function() {}
    };

    // Taxonomy Deactivation
    if (g_form.getValue("active") === "false") {
        showDialog(deactivationObj);
    }
    // Taxonomy Activation
    else {
        showDialog(activationObj);
    }

    //Helper functions
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

    function ActivateTaxonomyTopics() {
        var ajax = new GlideAjax('TopicList');
        ajax.addParam('sysparm_name', 'modifyTaxonomyTopics');
        ajax.addParam('sysparm_taxomomySysId', taxonomy);
        ajax.addParam('sysparm_deactivate', 'false');
        ajax.getXMLAnswer(function() {
            completeSubmit();
        });
    }

    function DeactivateTaxonomyTopics() {
        var ajax = new GlideAjax('TopicList');
        ajax.addParam('sysparm_name', 'modifyTaxonomyTopics');
        ajax.addParam('sysparm_taxomomySysId', taxonomy);
        ajax.addParam('sysparm_deactivate', 'true');
        ajax.getXMLAnswer(function() {
            completeSubmit();
        });
    }

    function completeSubmit() {
        gFormAlreadySubmitted = true;
        gsftSubmit(undefined, undefined, g_form.getActionName());
    }

    return false;
}
