function cancelWorkflow(idvalue) {

    var dialog = new GlideDialogWindow('glide_confirm_standard', false);
    dialog.setTitle(new GwtMessage().getMessage('Confirm cancel'));
    dialog.setPreference('title', 'Cancel this workflow?');
    dialog.setPreference('onPromptComplete', cancelWorkflowConfirmed);
    dialog.hideCloseButton();
    dialog.render();

    function cancelWorkflowConfirmed() {
        var pollInterval = 2;
        var waitCount = getWaitCount();
        
        // Send cancel command to workflow engine
        var contextId = idvalue;
        var ga = new GlideAjax('WorkflowCancelKill');
        ga.addParam('sysparm_name', 'cancelContext');
        ga.addParam('sysparm_context', contextId);
        ga.getXMLWait();
        if (!isContextExecuting(contextId)) {
            document.location.reload();
            return;
        }

        // Cancel did not occur yet. Show waiting dialog and start timeout timer
        var dialogWait = renderWaitDialog();
        var iCount = 0;
        var intervalTimer = setInterval(testCanceled, pollInterval * 1000);

        function testCanceled() {
            if (!isContextExecuting(contextId)) {
                finished();
            } else {
                if (++iCount >= waitCount) {
                    clearInterval(intervalTimer);
                    askUser();
                }
            }
        };

        function renderWaitDialog() {
            var dlg = new GlideDialogWindow('glide_progress_no_button');
            dlg.setTitle(new GwtMessage().getMessage('Wait for Cancel'));
            dlg.setPreference('title', new GwtMessage().getMessage("Waiting for the workflow to be canceled"));
            dlg.hideCloseButton();
            dlg.render();
            return dlg;
        };

        function askUser() {
            var complete = function() {
                var ga = new GlideAjax('WorkflowCancelKill');
                ga.addParam('sysparm_name', 'killContext');
                ga.addParam('sysparm_context', contextId);
                ga.getXMLWait();
                finished();
            };
            var cancel = function() {
                dialogWait = renderWaitDialog();
                iCount = 0;
                intervalTimer = setInterval(testCanceled, pollInterval * 1000);
            };
            dialogWait.destroy();
            var dialog = new GlideDialogWindow('continue_waiting_for_workflow_cancel');
            dialog.setTitle(new GwtMessage().getMessage('Force Cancel'));
            dialog.setPreference('title', new GwtMessage().getMessage("Continue waiting for the workflow to be canceled, or force cancelation?"));
            dialog.hideCloseButton();
            dialog.setPreference('onPromptComplete', complete.bind(this));
            dialog.setPreference('onPromptCancel', cancel.bind(this));
            dialog.render();
        };
        
        function finished() {
            clearInterval(intervalTimer);
            document.location.reload();
        };

        function isContextExecuting(contextId) {
            var ga = new GlideAjax('WorkflowCancelKill');
            ga.addParam('sysparm_name', 'isContextExecuting');
            ga.addParam('sysparm_context', contextId);
            ga.getXMLWait();
            var isCanceled = ga.getAnswer();
            return isCanceled != "false";
        };

        function getWaitCount() {
            var ga = new GlideAjax('WorkflowCancelKill');
            ga.addParam('sysparm_name', 'getTimeoutSecs');
            ga.getXMLWait();
            var secs = ga.getAnswer();
            return secs / pollInterval;
        };
    };
}
