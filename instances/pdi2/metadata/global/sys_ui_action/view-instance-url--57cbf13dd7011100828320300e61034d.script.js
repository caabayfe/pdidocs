/* 
 * Description: Show the URL for the Assessment backed Survey.  
 *
 * URL shown in dialog can be shared anywhere, and used to click back into the Survey.
 */	
function clickViewInstanceURL() {
    var dd = new GlideDialogWindow('survey_publish_url');
    dd.setTitle(getMessage('Survey URL'));
    dd.setPreference('sysparm_survey_instance', g_form.getUniqueValue());
    dd.setWidth(600);
    dd.render();
}
