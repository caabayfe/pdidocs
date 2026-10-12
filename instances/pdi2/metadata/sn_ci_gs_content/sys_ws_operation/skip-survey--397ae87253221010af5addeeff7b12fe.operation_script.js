(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var ciConfigId = "1bb0fa3353161010af5addeeff7b124b"; //CI Guided Setup Config

    try {
        var gr = new GlideRecord('guided_setup_configuration_response');
        gr.addQuery('parent_setup_config', ciConfigId);
        gr.setValue('active', false);
        gr.updateMultiple();

        gr.initialize();
        gr.setValue('category', 'skip_survey');
        gr.setValue('value', 'true');
        gr.setValue('parent_setup_config', ciConfigId);
        gr.insert();

        //remove the previous survey selections when survey is skipped
        var userPref = new GlideRecord('sys_user_preference');
        userPref.addQuery('name', 'save_survey_options');
        userPref.orderByDesc('sys_updated_on');
        userPref.setLimit(1);
        userPref.query();
        if (userPref.next())
            gs.getUser().savePreference("save_survey_options", '');

    } catch (e) {
        gs.error('Error occured in skip survey rest api' + e);
    }
})(request, response);
