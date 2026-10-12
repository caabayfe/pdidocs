function compareToCurrent() {
    if (typeof rowSysId == 'undefined')
        sysId = gel('sys_uniqueValue').value;
    else
        sysId = rowSysId;

    ScriptLoader.getScripts('/script/RecordPayloadUtil.js', function() {
        var ga0 = new GlideAjax('DiffMergeUICheck');
        ga0.addParam('sysparm_name', 'isUISupported');
        ga0.getXMLAnswer(function(isUISupported) {
            if (isUISupported !== 'true') {
                var ga = new GlideAjax("DiffAjax");
                ga.addParam("sysparm_name", "diffUpdateToCurrentVersion");
                ga.addParam("sysparm_update", sysId);
                ga.getXMLAnswer(comparisonDialog);
            } else {
                var returnUrlElem = gel('sysparm_referring_url');
                var returnUrl = '';
                if (returnUrlElem && returnUrlElem.value)
                    returnUrl = returnUrlElem.value;

                var url = new GlideURL("merge_form_current_update.do");
                url.addParam("sysparm_update_id", sysId);
                url.addParam("sysparm_referring_url", returnUrl);
                window.location = url.getURL();
            }
        });
    });
}

function comparisonDialog(answer) {
    var dialog = new GlideModal('', false, 'modal-95');
    dialog.setTitle('Conflict Comparison');
    dialog.renderWithContent('<div style="min-width: 400px; overflow-x: auto;">' + answer + '</div>');
}
