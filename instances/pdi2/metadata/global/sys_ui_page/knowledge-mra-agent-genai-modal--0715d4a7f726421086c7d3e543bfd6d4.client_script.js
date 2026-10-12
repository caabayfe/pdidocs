var isTimedOutAgent = false;
var isRespondedAgent = false;
var canShowLanguagePicker = false;
var tasksUsedByLLM = [];

function closeModal() {
    GlideModal.get().destroy();
    return false;
}

function cancel() {
    closeModal();
    var ga = new GlideAjax('sn_km_gen_ai.KBGenAIAjax');
    ga.addParam('sysparm_name', 'updateCancelMetadata');
    ga.addParam('sysparm_recordId', g_form.getUniqueValue());
    ga.getXMLAnswer(instrumentationResponse);
}

function generateFromGenAIButtonHandler() {
    var selectedRecords = GlideList2.get("${similarTasklistId}").getChecked();
    g_scratchpad.km_selected_tasks_gen_ai = selectedRecords;
    closeModal();
	var ga = new GlideAjax('sn_km_gen_ai.KBGenAIAjax');
	ga.addParam('sysparm_name', 'canShowLanguagePicker');
	ga.addParam('sysparm_source_table', g_scratchpad.source_table);
	ga.addParam('sysparm_target_table', g_form.getTableName());
	ga.getXMLAnswer(showLanguagePickerCheck);
}

function showLanguagePickerCheck(answer) {
    if (answer == "true") {
        showLanguagePicker();
    } else {
        showKBGenAILoadingDialog();
    }
}

function showLanguagePicker(){
	var clientSideTimeout = parseInt('${JS:sysparm_genai_client_timeout}');
	g_scratchpad.kb_article_client_side_timeout = clientSideTimeout;
	g_scratchpad.article_source_task = g_form.getValue('source');
	var languagePickerModal = new GlideModal('sn_km_gen_ai_kb_and_language_popup');
	languagePickerModal.setPreference('focusTrap', true);
	languagePickerModal.setPreference('sysparm_genai_client_timeout', clientSideTimeout);
	languagePickerModal.render();
}

function showKBGenAILoadingDialog() {
    var loadingDialog = new GlideModal('knowledge_genAI_loading_modal');
    loadingDialog.setWidth(619);
    loadingDialog.setPreference('focusTrap', true);
    loadingDialog.on('bodyrendered', function() {
        getResponse();
    });
    loadingDialog.render();

    // client-side timeout catcher
    var clientSideTimeout = parseInt('${JS:sysparm_genai_client_timeout}');
    var selectedRecords = g_scratchpad.km_selected_tasks_gen_ai;
    var selectedRecordsArr = selectedRecords!=''?selectedRecords.split(','):[];
    if(selectedRecordsArr.length >0)
        clientSideTimeout = clientSideTimeout*3;
        setTimeout(function() {
            if (isRespondedAgent)
                return;
    
            isTimedOutAgent = true;
            hideLoadingDialog();
            g_form.clearMessages();
            g_form.addErrorMessage(getMessage("There was a problem generating this article with AI (timed out). You can write it yourself now if you'd like."));
        }, clientSideTimeout);
}


function getResponse() {
    var selectedRecords = g_scratchpad.km_selected_tasks_gen_ai;
    var selectedRecordsArr = selectedRecords!=''?selectedRecords.split(','):[];
    if(selectedRecordsArr.length >=1 && selectedRecordsArr.length <=5){
        selectedRecordsArr.push(g_form.getValue('source'));
        var relevantTaskIds = selectedRecordsArr.join(',');
        var ga = new GlideAjax('sn_km_gen_ai.KBGenAIAjax');
        ga.addParam('sysparm_name', 'getMultiTaskArticleContentFromGenAI');
        ga.addParam('sysparm_classname', g_form.getTableName());
        ga.addParam('sysparm_targetTableSysId', g_form.getUniqueValue());
        ga.addParam('sysparm_selectedRecords',relevantTaskIds);
        ga.getXML(waitForResponseOnAmbChannel);
    }else{
        var ga = new GlideAjax('sn_km_gen_ai.KBGenAIAjax');
        ga.addParam('sysparm_name', 'getArticleContentFromGenAI');
        ga.addParam('sysparm_sourcetask', g_form.getValue('source'));
        ga.addParam('sysparm_classname', g_form.getTableName());
        ga.addParam('sysparm_targetTableSysId', g_form.getUniqueValue());
        ga.getXML(parseResponse);
    }
    
}

function waitForResponseOnAmbChannel(response) {
    var data = response.responseXML.documentElement.getAttribute("answer");
    if (data != null && data !=-1 && data!='"\\"-1\\""') {
        var amb = window.top.g_ambClient;
        var channelId = '/knowledge/response/' + g_form.getUniqueValue();
        watcherChannel = amb.getChannel(channelId);
        watcher = watcherChannel.subscribe(handleAmbResponse);
    }else{
        isTimedOutAgent = true;
        hideLoadingDialog();
        g_form.clearMessages();
        g_form.addErrorMessage(getMessage("There was a problem generating this article with AI. You can write it yourself now if you'd like."));
    }
}

function handleAmbResponse(response){
    hideLoadingDialog();
    if (isTimedOutAgent) {
        return;
    }

    isRespondedAgent = true;
	tasksUsedByLLM = response.data.task_ids;
	if(response.data.success == "false" || !tasksUsedByLLM.split(',').includes(g_form.getValue('source'))){
		var errorMsg = response.data.errorMessage || getMessage('AI detected content that may be harmful or offensive while processing this request. Your organization has chosen to block the output.');
		g_form.addErrorMessage(errorMsg);
		return;
	}
    var data = {};
    data.success = true;
    data.fields = response.data.outputFields;
    data = JSON.stringify(data);
    updateFieldValuesforArticle(data);
}

function parseResponse(response) {
    hideLoadingDialog();
    if (isTimedOutAgent) {
        return;
    }
    isRespondedAgent = true;
    var data = response.responseXML.documentElement.getAttribute("answer");
    tasksUsedByLLM = g_form.getValue('source');
    updateFieldValuesforArticle(data);
}

function getTaskList(){
	var taskArr = tasksUsedByLLM.split(',');
	var gr = new GlideRecord(g_scratchpad.source_table);
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

function updateInstrumentationData() {
	var selectedRecords = tasksUsedByLLM;
	var selectedRecordsArr = selectedRecords != '' ? selectedRecords.split(',') : [];
    var ga = new GlideAjax('sn_km_gen_ai.KBGenAIAjax');
    ga.addParam('sysparm_name', 'updateTaskListMetadata');
    ga.addParam('sysparm_recordId', g_form.getUniqueValue());
    ga.addParam('sysparm_taskList',selectedRecordsArr);
    ga.getXMLAnswer(updateIsGeneratedFromCustomTemplateFrameworkMetadata);
}

function updateIsGeneratedFromCustomTemplateFrameworkMetadata(response) {
    var answer = JSON.parse(response);
    console.log(answer.message);
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

function hideLoadingDialog() {
    var modal = new GlideModal().get('knowledge_genAI_loading_modal');
    modal.destroy();
}

var customizeListUI = function() {
    //Open Links in New Tab
    var numberLinks = document.getElementById('list_span').getElementsByClassName('linked formlink');
    for (var i = 0; i < numberLinks.length; i++) {
        numberLinks[i].setAttribute('target', '_blank');
    }

    //Hide list bottom nav
    var actionElement = document.getElementById('list_span').getElementsByClassName('list_nav list_nav_bottom ');
    if (actionElement.length) {
        actionElement[0].style.display = 'none';
    }
    //Hide select all checkbox
    document.getElementById('allcheck_${similarTasklistId}').parentElement.style.display = 'none';
    //Dynamically change button based on number of selected tasks
    addClickListener();
};

function addClickListener() {
    var elements = document.querySelectorAll('input[type="checkbox"][data-list_id="${similarTasklistId}"]');
    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener('change', function(event) {
            var selectedRecords = GlideList2.get("${similarTasklistId}").getChecked();
            var createWithTasksBtn = document.getElementById("create-button-tasks");
            var createWithoutTasksBtn = document.getElementById("create-button");
            var arr = selectedRecords.split(",");
            if (selectedRecords == "" || arr.length == 0) {
                createWithoutTasksBtn.style.display = 'inline-flex';
                createWithTasksBtn.style.display = 'none';
            } else if (arr.length > 0 && arr.length <= 5) {
                createWithoutTasksBtn.style.display = 'none';
                createWithTasksBtn.style.display = 'inline-flex';
                createWithTasksBtn.disabled = false;
            } else if (arr.length > 5) {
                createWithoutTasksBtn.style.display = 'none';
                createWithTasksBtn.style.display = 'inline-flex';
                createWithTasksBtn.disabled = true;
            }
        });
    }
}

CustomEvent.observe('list.loaded', customizeListUI);
CustomEvent.observe('partial.page.reload', customizeListUI);
