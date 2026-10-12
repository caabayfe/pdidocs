/* 
 * Description: Show the URL for the Assessment backed Survey.  
 *
 * URL shown in dialog can be shared anywhere, and used to click back into the Survey.
 */	
function clickViewSurveyURL() {
    var dialog = new GlideModal('survey_publish_url');
    dialog.setPreference('sysparm_survey', g_form.getUniqueValue());
    dialog.setTitle(getMessage('Survey URL'));
    dialog.render();
}
