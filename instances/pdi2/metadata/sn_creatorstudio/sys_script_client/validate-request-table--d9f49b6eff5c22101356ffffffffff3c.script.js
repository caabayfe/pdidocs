// Map validation keys to user-friendly messages
var fieldMessageMap = {
    isTaskExtension: getMessage('Selected table is not a Task-based table.'),
    hasRequestType: getMessage("Selected table doesn't have the request_type column.")
};

function onChange() {
    var tableName = g_form.getValue('request_table');
    // Validate the selected table via GlideAjax
    var ga = new GlideAjax('sn_creatorstudio.RequestTableValidator');
    ga.addParam('sysparm_name', 'validateRequestTable');
    ga.addParam('sysparm_table', tableName);
    ga.getXML(handleResponse);
}

function handleResponse(serverResponse) {
    var answer = serverResponse.responseXML.documentElement.getAttribute('answer');

    try {
        var parsedAnswer = JSON.parse(answer);
        // Loop through validation results and show contextual warnings
        for (var key in parsedAnswer) {
            if (fieldMessageMap.hasOwnProperty(key) && parsedAnswer[key] === false)
                g_form.showFieldMsg('request_table', fieldMessageMap[key], 'warning');
        }
    } catch (e) {
        console.error(getMessage('Failed to parse server response: '), e);
        g_form.showFieldMsg('request_table', getMessage('Unexpected error occurred while validating table.'), 'error');
    }
}
