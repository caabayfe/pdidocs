var isTimedOut = false;
var isResponded = false;
var canShowLanguagePicker = false;
var tasksUsedByLLM = [];

function cancel() {
    GlideModal.get().destroy();
    return false;
}

function generateFromGenAI() {
    cancel();
    if (!g_form.getValue('source')) {
        showKBGenAIAuthorDialog();
    } else {
        canShowLanguagePickerCheckForAgent();
        setTimeout(showKBGenAILoadingDialog, 100, true);
    }
}

function getSourceTable(sysId)
{
	var gr = new GlideRecord("task");
	gr.get(sysId);
	return gr.getValue("sys_class_name");
}

function canShowLanguagePickerCheckForAgent(){
	var sourceTable = getSourceTable(g_form.getValue('source'));
	g_scratchpad.source_table = sourceTable;
	var targetTable = g_form.getTableName();
	var ga = new GlideAjax('sn_km_gen_ai.KBGenAIAjax');
	ga.addParam('sysparm_name', 'canShowLanguagePicker');
	ga.addParam('sysparm_source_table', sourceTable);
	ga.addParam('sysparm_target_table', targetTable);
	ga.getXMLAnswer(showLanguagePickerSetValue);
}

function showLanguagePickerSetValue(answer)
{
	canShowLanguagePicker = answer == "true" ? true : false;
}

function showKBGenAIAuthorDialog() {
    var clientSideTimeout = parseInt('${JS:sysparm_genai_client_timeout}');
    var authorDialog = new GlideModal('knowledge_mra_author_genAI_modal');
    authorDialog.setTitle(getMessage("Search for tasks to draft this article - Select up to 5 to help in the creation of article"));
    authorDialog.setWidth(900);
    authorDialog.setPreference('focusTrap', true);
    authorDialog.setPreference('sysparm_genai_client_timeout', clientSideTimeout);
    authorDialog.setPreference('sysparm_template_name',g_form.getTableName());
    authorDialog.render();
}

function showKBGenAILoadingDialog(useAdditionalTasks) {
    var loadingDialog = new GlideModal('knowledge_genAI_loading_modal');
    loadingDialog.setWidth(619);
    loadingDialog.setPreference('focusTrap', true);
    loadingDialog.on('bodyrendered', function() {
        getResponse(useAdditionalTasks);
    });
    loadingDialog.render();

    // client-side timeout catcher
    var clientSideTimeout = parseInt('${JS:sysparm_genai_client_timeout}');
    setTimeout(function() {
        if (isResponded)
            return;

        isTimedOut = true;
        hideLoadingDialog();
        g_form.clearMessages();
        g_form.addErrorMessage(getMessage("There was a problem generating this article with AI (timed out). You can write it yourself now if you'd like."));
    }, clientSideTimeout);
}

function getSimilarTasks() {
    var ga = new GlideAjax('sn_km_gen_ai.KBGenAIAjax');
    ga.addParam('sysparm_name', 'getSimilarTasks');
    ga.addParam('sysparm_sourcetask', g_form.getValue('source'));
    ga.getXML(showSimilarTaskDialog);
}

function showSimilarTaskDialog(response) {
    hideLoadingDialog();
    if (isTimedOut) {
        return;
    }
    isResponded = true;
    var data = response.responseXML.documentElement.getAttribute("answer");
    if (data != null) {
        data = JSON.parse(data);
        if (data.length > 0) {
            var clientSideTimeout = parseInt('${JS:sysparm_genai_client_timeout}');
            var similarTaskSelectDialog = new GlideModal('knowledge_mra_agent_genAI_modal');
            similarTaskSelectDialog.setWidth(900);
            similarTaskSelectDialog.setPreference('focusTrap', true);
            similarTaskSelectDialog.setPreference('sysparm_genai_client_timeout', clientSideTimeout);
            similarTaskSelectDialog.setPreference('sysparm_table', data.table);
            similarTaskSelectDialog.setPreference('sysparm_query', data.query+'^table='+data.table);
            similarTaskSelectDialog.render();
        } else
            showKBGenAILoadingDialog(false);
    } else
        showKBGenAILoadingDialog(false);
}

function getResponse(useAdditionalTasks) {
    if (useAdditionalTasks) {
        getSimilarTasks();
    }
	else if(canShowLanguagePicker){
		showLanguagePicker();
	}
	else {
        var ga = new GlideAjax('sn_km_gen_ai.KBGenAIAjax');
        ga.addParam('sysparm_name', 'getArticleContentFromGenAI');
        ga.addParam('sysparm_sourcetask', g_form.getValue('source'));
        ga.addParam('sysparm_classname', g_form.getTableName());
        ga.addParam('sysparm_targetTableSysId', g_form.getUniqueValue());
        ga.getXML(parseResponse);
    }
}

function parseResponse(response) {
    hideLoadingDialog();
    if (isTimedOut) {
        return;
    }
    isResponded = true;
    var data = response.responseXML.documentElement.getAttribute("answer");
    tasksUsedByLLM = g_form.getValue('source');
    updateFieldValuesforArticle(data);
}

function getTaskList(){
	var taskArr = tasksUsedByLLM.split(',');
	var sourceTable = getSourceTable(g_form.getValue('source'));
	var gr = new GlideRecord(sourceTable);
	var taskNumbers = "";
	taskArr.forEach(function(task, idx){
		gr.get(task);
		taskNumbers = taskNumbers + gr.number; 

		if(idx < taskArr.length - 1){
			taskNumbers += ", ";
		}
	});
	
	return taskNumbers;
}

function updateFieldValuesforArticle(data) {
    g_form.clearMessages();
    if (data != null) {
        data = JSON.parse(data);
        if (data['success']) {
            var fieldObj = data['fields'];
            for (var key in fieldObj) {
                g_form.setValue(key, fieldObj[key]);
                g_form.modified = true;
            }
			updateInstrumentationData();
            showGenAIMessage();
            var list = getTaskList();
	    var gwtMsg = new GwtMessage();
	    var msg = gwtMsg.getMessage('Article successfully generated from the following record(s): {0}. Be sure to check AI-generated content for accuracy.', list);
            g_form.addFormMessage(msg, 'suggestion');
        } else
            g_form.addErrorMessage(data['errorMessage']);

    } else
        console.log("ERROR: Article fields can not be updated as data from server response is null.");
}

function updateInstrumentationData() {
    var updateIsGeneratedFromCustomTemplateFramework = new GlideAjax('sn_km_gen_ai.KBGenAIAjax');
    updateIsGeneratedFromCustomTemplateFramework.addParam('sysparm_name', 'updateIsGeneratedFromCustomTemplateFrameworkMetadata');
    updateIsGeneratedFromCustomTemplateFramework.addParam('sysparm_recordId', g_form.getUniqueValue());
    updateIsGeneratedFromCustomTemplateFramework.addParam('sysparm_source_table',g_scratchpad.source_table);
    updateIsGeneratedFromCustomTemplateFramework.addParam('sysparm_target_table',g_form.getTableName());
    updateIsGeneratedFromCustomTemplateFramework.getXMLAnswer(instrumentationResponse);
}

function instrumentationResponse(response) {
    var answer = JSON.parse(response);
    console.log(answer.message);
}

function hideLoadingDialog() {
    var modal = new GlideModal().get('knowledge_genAI_loading_modal');
    modal.destroy();
}

function showLanguagePicker(){
	hideLoadingDialog();
	var clientSideTimeout = parseInt('${JS:sysparm_genai_client_timeout}');
	g_scratchpad.kb_article_client_side_timeout = clientSideTimeout;
	g_scratchpad.article_source_task = g_form.getValue('source');
	var languagePickerModal = new GlideModal('sn_km_gen_ai_kb_and_language_popup');
	languagePickerModal.setPreference('focusTrap', true);
	languagePickerModal.setPreference('sysparm_genai_client_timeout', clientSideTimeout);
	languagePickerModal.render();
}
