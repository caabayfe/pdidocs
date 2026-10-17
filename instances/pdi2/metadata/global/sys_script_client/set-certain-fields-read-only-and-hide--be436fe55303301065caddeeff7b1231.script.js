function onLoad() {

    var isNew = g_form.isNewRecord();

    if (!isNew)
        g_form.setReadOnly('target_table_name', true);

    //Retrain scheduled job will be dynamically created on insert/update of config record
    g_form.setReadOnly('retrain_scheduled_job', true);

    var ga = new GlideAjax('AutoResolutionMLAjax');
    ga.addParam('sysparm_name', 'doMLandNLUChecks');
    ga.addParam('sysparm_sysId', g_form.getUniqueValue());
    ga.getXML(process); // async ajax call
	
}

function process(response) {
    var result = JSON.parse(response.responseXML.documentElement.getAttribute('answer'));
    if (result) {
        //if training is in progress Training Language glide list should be set to readonly
        if (!result.languageConfigPresent || result.trainingCompleted)
            g_form.setReadOnly('training_language', false);
        else if (!result.trainingCompleted)
            g_form.setReadOnly('training_language', true);
        else
            g_form.setReadOnly('training_language', false);

        if (!result.intentsPresent)
            g_form.addErrorMessage(getMessage('Your Auto-Resolution intents aren\'t accessible for topic mapping. Check that the prediction server is set up.'));
    }
}
