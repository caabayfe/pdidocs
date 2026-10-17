function copyFindingDefinition() {
    var map = getMessages(["Are you sure?", "Do you want to copy this configuration and create new finding definition?"]);

    var dialogClass = (typeof GlideModal !== 'undefined') ? GlideModal : GlideDialogWindow;
    var dialog = new dialogClass('glide_confirm_basic');
    dialog.setTitle(map["Are you sure?"]);
    dialog.setPreference('title', map["Do you want to copy this configuration and create new finding definition?"] + "<br/><br/>");
    dialog.setPreference('onPromptComplete', onPromptCompleteForCopyFindingDef);
    dialog.render();
}

function onPromptCompleteForCopyFindingDef() {
    gsftSubmit(null, g_form.getFormElement(), 'copy_finding_definition');
}

if (typeof window == 'undefined')
    copyFindingDef();  


function copyFindingDef() {
    var grNewFinding = new global.ProminUIAction().copyFindingConfig(current);
    action.setRedirectURL(grNewFinding); 
} 
