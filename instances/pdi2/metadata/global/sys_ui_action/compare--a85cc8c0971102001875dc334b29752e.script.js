function compare() {
    var ids = g_list.getChecked().split(",");
    if (ids.length != 2) {
        alert("Can only compare 2 versions");
        return;
    }

    var oneVersion = _getVersion(ids[0]);
    if (oneVersion == null) {
        alert(getMessage("This version for {0} is not found", ids[0]));
        return;
    }

    var twoVersion = _getVersion(ids[1]);
    if (twoVersion == null) {
        alert(getMessage("This version for {0} is not found", ids[1]));
        return;
    }

    if (oneVersion.name != twoVersion.name) {
        alert(getMessage("Versions must be from same record"));
        return;
    }

    //If one or two is current, then show compare to current form.
    var url;
    if (_isCurrentVersion(oneVersion)) {
        url = new GlideURL("merge_form_current_version.do");
        url.addParam("sysparm_version_id", ids[1]);
        _showDiffMerge(url, ids);
    } else if (_isCurrentVersion(twoVersion)) {
        url = new GlideURL("merge_form_current_version.do");
        url.addParam("sysparm_version_id", ids[0]);
        _showDiffMerge(url, ids);
    } else {
        url = new GlideURL("merge_form_select_version_ro.do");
        url.addParam("sysparm_version1", ids[0]);
        url.addParam("&sysparm_version2", ids[1]);
        _showDiffMerge(url, ids);
    }
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
    ga.addParam("sysparm_record1", ids[0]);
    ga.addParam("sysparm_record2", ids[1]);
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
