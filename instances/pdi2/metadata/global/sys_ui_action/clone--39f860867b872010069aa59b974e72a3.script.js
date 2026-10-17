function copyTaxonomyTree() {
    dialog = new GlideModal('copy_taxonomy_tree');
    dialog.setTitle(getMessage("Please provide a name for the new copy of taxonomy"));
    dialog.setPreference('onPromptComplete', confirm);
    dialog.setPreference('onPromptCancel', cancel);
    dialog.setPreference('focusTrap', true);
    dialog.setWidth(400);
    dialog.render();
}

function confirm() {
    var ga = new GlideAjax('TopicList');
    ga.addParam('sysparm_name', 'copyTaxonomyTree');
    ga.addParam('sysparm_currentTaxonomyId', g_form.getUniqueValue());
    ga.addParam('sysparm_newTaxonomyName', $j("#taxonomy_name").val());
    ga.getXML(responseParse);
}

function cancel() {
    return false;
}

function responseParse(response) {
    if (response) {
        var result = response.responseXML.documentElement.getAttribute("answer");
        if (result.length > 0) {
            var newTaxonomyId = result;
            var redirectionId = newTaxonomyId ? newTaxonomyId : g_form.getUniqueValue();
            var redirectUrl = "taxonomy.do?sys_id=" + redirectionId;
            g_navigation.open(redirectUrl);

        } else
            g_form.addErrorMessage("Error copying taxonomy, Please refer logs");
    }
}
