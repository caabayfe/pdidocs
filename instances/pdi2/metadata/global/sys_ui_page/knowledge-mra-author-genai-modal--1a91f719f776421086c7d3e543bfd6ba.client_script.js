var isTimedOutAuthor = false;
var isRespondedAuthor = false;
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

function getSourceTable(selectedRecords)
{
	var sysId = selectedRecords.split(',')[0];
	var gr = new GlideRecord("task");
	gr.get(sysId);
	return gr.getValue("sys_class_name");
}

function generateFromGenAIButtonHandler() {
    var selectedRecords = GlideList2.get("${similarTasklistId}").getChecked();
    g_scratchpad.km_selected_tasks_gen_ai = selectedRecords;
	g_scratchpad.kb_article_client_side_timeout = parseInt('${JS:sysparm_genai_client_timeout}');
	g_scratchpad.source_table = getSourceTable(selectedRecords);
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
    if(selectedRecordsArr.length >1)
        clientSideTimeout = clientSideTimeout*3;
    setTimeout(function() {
        if (isRespondedAuthor)
            return;

        isTimedOutAuthor = true;
        hideLoadingDialog();
        g_form.clearMessages();
        g_form.addErrorMessage(getMessage("There was a problem generating this article with AI (timed out). You can write it yourself now if you'd like."));
    }, clientSideTimeout);
}


function getResponse() {
    var selectedRecords = g_scratchpad.km_selected_tasks_gen_ai;
    var selectedRecordsArr = selectedRecords!=''?selectedRecords.split(','):[];
    if(selectedRecordsArr.length >1 && selectedRecordsArr.length <=5){
        var relevantTaskIds = selectedRecordsArr.join(',');
        var ga = new GlideAjax('sn_km_gen_ai.KBGenAIAjax');
        ga.addParam('sysparm_name', 'getMultiTaskArticleContentFromGenAI');
        ga.addParam('sysparm_classname', g_form.getTableName());
        ga.addParam('sysparm_targetTableSysId', g_form.getUniqueValue());
        ga.addParam('sysparm_selectedRecords',relevantTaskIds);
        ga.getXML(waitForResponseOnAmbChannel);
    }else if(selectedRecordsArr.length ==1){
        var ga = new GlideAjax('sn_km_gen_ai.KBGenAIAjax');
        ga.addParam('sysparm_name', 'getArticleContentFromGenAI');
        ga.addParam('sysparm_sourcetask', selectedRecordsArr[0]);
        ga.addParam('sysparm_classname', g_form.getTableName());
        ga.addParam('sysparm_targetTableSysId', g_form.getUniqueValue());
        ga.getXML(parseGenAIResponse);
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
        isTimedOutAuthor = true;
        hideLoadingDialog();
        g_form.clearMessages();
        g_form.addErrorMessage(getMessage("There was a problem generating this article with AI. You can write it yourself now if you'd like."));
    }
}

function handleAmbResponse(response){
    hideLoadingDialog();
    if (isTimedOutAuthor) {
        return;
    }
    isRespondedAuthor = true;
    if(response.data.success == "false"){
		g_form.addErrorMessage(response.data.errorMessage);
		return;
	}
    var data = {};
    data.success = true;
    data.fields = response.data.outputFields;
    data = JSON.stringify(data);
    tasksUsedByLLM = response.data.task_ids;
    updateFieldValuesforArticle(data);
}

function parseGenAIResponse(response) {
    hideLoadingDialog();
    if (isTimedOutAuthor) {
        return;
    }
    isRespondedAuthor = true;
    var data = response.responseXML.documentElement.getAttribute("answer");
    tasksUsedByLLM = g_scratchpad.km_selected_tasks_gen_ai;
    updateFieldValuesforArticle(data);
}

function updateInstrumentationData() {
    var ga = new GlideAjax('sn_km_gen_ai.KBGenAIAjax');
    ga.addParam('sysparm_name', 'updateTaskListMetadata');
    ga.addParam('sysparm_recordId', g_form.getUniqueValue());
    ga.addParam('sysparm_taskList', tasksUsedByLLM);
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

function getTaskList(){
	var taskArr = tasksUsedByLLM.split(',');
	var srcTable = getSourceTable(tasksUsedByLLM);
	var gr = new GlideRecord(srcTable);
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
            }
            updateInstrumentationData();
            showGenAIMessage();
	    var list = getTaskList();
	    var gwtMsg = new GwtMessage();
	    var msg = gwtMsg.getMessage('Article successfully generated from the following record(s): {0}. Be sure to check AI-generated content for accuracy.', list);
            g_form.addFormMessage(msg, 'suggestion');
        } else
            g_form.addErrorMessage(data['errorMessage']);

    } else{
        console.error("ERROR: Article fields can not be updated as data from server response is null.");
	}
}

function hideLoadingDialog() {
    var modal = new GlideModal().get('knowledge_genAI_loading_modal');
    modal.destroy();
}

function search() {
    var searchText = document.getElementById("searchText").value;
    var searchProfile = document.getElementById("dropdown").value;
    if (!searchText || !searchProfile)
        alert("Please select search profile and provide a keyword for search");
    else {
        //Implement loading
        var ga = new GlideAjax('sn_km_gen_ai.KBGenAIAjax');
        ga.addParam('sysparm_name', 'searchTasks');
        ga.addParam('sysparm_search_profile', searchProfile);
        ga.addParam('sysparm_search_keyword', searchText);
        ga.getXML(parseSearchResponse);
    }

}

function parseSearchResponse(response) {
    var data = response.responseXML.documentElement.getAttribute("answer");
    var emptyQuery = "sys_idIN";
    var list = GlideList2.get("${similarTasklistId}");
    if (data != null) {
        data = JSON.parse(data);
        if (data.length > 0) {
            list.setFilterAndRefresh(data.query+'^table='+data.table);
        } else list.setFilterAndRefresh(emptyQuery);
    } else list.setFilterAndRefresh(emptyQuery);
}

var customizeListUI = function() {
    var task_list = document.getElementById('task_list');
    if (task_list) {
        //Open Links in New Tab
        var numberLinks = task_list.getElementsByClassName('linked formlink');
        for (var i = 0; i < numberLinks.length; i++) {
            numberLinks[i].setAttribute('target', '_blank');
        }

        //Hide list bottom nav
        var actionElement = task_list.getElementsByClassName('list_nav list_nav_bottom ');
        if (actionElement.length) {
            actionElement[0].style.display = 'none';
        }
    }

    //Hide select all checkbox
    var selectallcheckbox = document.getElementById('allcheck_${similarTasklistId}');
    if (selectallcheckbox) {
        selectallcheckbox.parentElement.style.display = 'none';
    }

    //Disable button initially
    var createWithTasksBtn = document.getElementById("create-button-tasks");
    createWithTasksBtn.disabled = true;


    //Dynamically change button based on number of selected tasks
    addClickListener();
};

function addClickListener() {
    var elements = document.querySelectorAll('input[type="checkbox"][data-list_id="${similarTasklistId}"]');
    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener('change', function(event) {
            var selectedRecords = GlideList2.get("${similarTasklistId}").getChecked();
            var createWithTasksBtn = document.getElementById("create-button-tasks");
            var arr = selectedRecords.split(",");
            if (selectedRecords == "" || arr.length == 0) {
                createWithTasksBtn.disabled = true;
            } else if (arr.length > 0 && arr.length <= 5) {
                createWithTasksBtn.disabled = false;
            } else if (arr.length > 5) {
                createWithTasksBtn.disabled = true;
            }
        });
    }
}

CustomEvent.observe('list.loaded', customizeListUI);
CustomEvent.observe('partial.page.reload', customizeListUI);
