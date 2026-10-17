function CompareToCurrent() {
    if (typeof rowSysId == 'undefined')
        sysId = gel('sys_uniqueValue').value;
    else
        sysId = rowSysId;

    var gr = new GlideRecord("sys_backout_problem");
    gr.addQuery("sys_id", sysId);
    gr.query();
    if (gr.next()) {
        ScriptLoader.getScripts('/script/RecordPayloadUtil.js', function() {
            var ga0 = new GlideAjax('DiffMergeUICheck');
            ga0.addParam('sysparm_name', 'isUISupported');
            ga0.getXMLAnswer(function(isUISupported) {
                if (isUISupported !== 'true') {
                    var ga = new GlideAjax("DiffAjax");
                    ga.addParam("sysparm_name", "diffBackOutProblemToCurrentVersion");
                    ga.addParam("sysparm_version", gr.version);
                    ga.getXMLAnswer(createDiffPane);
                } else {
                    var returnUrlElem = gel('sysparm_referring_url');
                    var returnUrl = '';
                    if (returnUrlElem && returnUrlElem.value)
                        returnUrl = returnUrlElem.value;

                    var url = new GlideURL("merge_form_current_version.do");
                    url.addParam("sysparm_version_id", gr.getValue("version"));
                    url.addParam("sysparm_referring_url", returnUrl);
                    window.location = url.getURL();
                }
            });
        });
    }
}

function createDiffPane(answer) {
    // null cases can include security restriction or unknown states
    if (answer == null)
        return;
    // show as message to user if answer does not contain payload
    if (answer.indexOf("<") == -1) {
        alert(answer);
    } else {
        var dialog = new GlideBox({
            body: answer,
            title: "Compare to Current",
            height: "95%",
            width: "95%",
            autoDimensionOnLoad: 'false'
        });
        answer.evalScripts(true);
        dialog.render();
    }
}
