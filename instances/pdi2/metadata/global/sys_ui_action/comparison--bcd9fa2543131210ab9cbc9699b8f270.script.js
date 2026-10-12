function compare() {
    var sysId = ((typeof rowSysId == 'undefined') || rowSysId === null) ? g_form.getUniqueValue() : rowSysId;
    var ga = new GlideAjax("ATFTracingHelperAjax");
    ga.addParam("sysparm_name", "getUpdateVersionsForComparision");
    ga.addParam("sysparm_what_changed_sys_id", sysId);
    ga.getXMLAnswer(ajaxCallbackFunction);
}

function ajaxCallbackFunction(answer) {
    try {
        answer = JSON.parse(answer); // Convert json string to object
        var verions1SysId = answer.version1SysId;
        var version2Sysid = answer.version2SysId;
    } catch (e) {
        jslog("Could not parse JSON object");
        return;
    }

    //If one or two is current, then show compare to current form.
    var url;
    var ids = [];
    ids.push(verions1SysId);
    ids.push(version2Sysid);
    url = new GlideURL("merge_form_select_version_ro.do");
    url.addParam("sysparm_version1", verions1SysId);
    url.addParam("&sysparm_version2", version2Sysid);
    _showDiffMerge(url, ids);

}

function createCompareWindow(answer) {
    if (answer == "different names") {
        alert("versions must be from same record");
        return;
    }
    var dialog = new GlideBox({
        body: answer,
        title: 'Compare Versions',
        height: '95%',
        width: '95%',
        autoDimensionOnLoad: true
    });
    answer.evalScripts(true);
    dialog.render();
}

function _showDiffMerge(url, ids) {
    ScriptLoader.getScripts('/script/RecordPayloadUtil.js', function() {
        var ga0 = new GlideAjax('DiffMergeUICheck');
        ga0.addParam('sysparm_name', 'isUISupported');
        ga0.getXMLAnswer(function(isUISupported) {
            if (isUISupported !== 'true') {
                _showCompare(ids);
            } else {
                var returnUrlElem = gel('sysparm_referring_url');
                var returnUrl = '';
                if (returnUrlElem && returnUrlElem.value)
                    returnUrl = returnUrlElem.value;
				
                url.addParam('sysparm_referring_url', returnUrl);
				window.location = url.getURL();
            }
        });
    });
}

function _showCompare(ids) {
    var ga = new GlideAjax("DiffAjax");
    ga.addParam("sysparm_name", "diffTwoRecordPayloads");
    ga.addParam("sysparm_record1", previous);
    ga.addParam("sysparm_record2", current);
    ga.addParam("sysparm_table", "sys_update_version");
    ga.getXMLAnswer(createCompareWindow);
}

function _getVersion(sysId) {
    var gr = new GlideRecord("sys_update_version");
    gr.addQuery("sys_id", sysId);
    gr.query();
    if (!gr.next())
        return null;

    return gr;
}

function _isCurrentVersion(gr) {
    if (gr == null)
        return false;

    return (gr.getValue("state") == "current");
}
