function onPublishActionClicked() {
    if (g_form.getTableName() == "kb_knowledge_block")
        gsftSubmit(null, g_form.getFormElement(), 'publish_knowledge');
    else {
        var checkGuestAccess = new GlideAjax("KBAjax");
        checkGuestAccess.addParam("sysparm_type", "checkGuestUserHasAccess");
        checkGuestAccess.addParam("sysparm_id", g_form.getUniqueValue());
        checkGuestAccess.getXML(function(response) {
            var answer = '';
            if (response && response.responseXML && response.responseXML.documentElement)
                answer = response.responseXML.documentElement.getAttribute("answer") + '' == 'true' ? true : false;
            if (answer)
                renderModal();
            else
                gsftSubmit(null, g_form.getFormElement(), 'publish_knowledge');
        });

    }
}

function renderModal() {
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    dialog = new dialogClass('confirm_publish');
    dialog.setTitle('Confirmation');
    dialog.setWidth(450);
    dialog.render();
}

if (typeof window == 'undefined') {
    publish();
}

function closeDialogAndPublish() {
    dialog.destroy();
    gsftSubmit(null, g_form.getFormElement(), 'publish_knowledge');
}

function publish() {
    new global.KnowledgeUIAction().publish(current);
}
