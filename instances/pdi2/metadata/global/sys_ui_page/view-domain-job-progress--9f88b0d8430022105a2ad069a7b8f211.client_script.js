viewProgress(false);

function viewProgress(refreshed) {
    var ajax = new GlideAjax('DomainJobTypesAjax');
    ajax.addParam('sysparm_name', 'getJobTypeProgress');
    ajax.addParam('sysparm_jobName', trim($("jobType").value));
    ajax.getXMLAnswer(processResponse);

    function processResponse(responseStr) {
        clearNotificationsMessages();
        var response = JSON.parse(responseStr);
        var error = response['error'];
        $("status").innerHTML = error ? '' : response['status'];
        $("progress").innerHTML = error ? '' : response['progress'];

        if (error) {
            $("notification-error").show();
            $("notification-error-message").innerHTML = error;
        }

        if (!error && refreshed) {
            $("notification-success").show();
        }
    }
}

function clearNotificationsMessages() {
    $("notification-success").hide();
    $("notification-error").hide();
}
