runExport();

function runExport() {
    var exportSetId = gel('export_set_id').value;
    var testMode = gel('export_set_test_mode').value;
    var exportSetName = gel('export_set_name').value;
    var uiAction = gel('export_set_action').value;
    var workerId, exportSetRunId;
    
    var translatedTextMap = new GwtMessage().getMessages(["View", "Success", "Failure", "Export can take long time", "view status in", "to see", "Click", "is not exported", "is exported"]);
    
    GlideDialogWindow.get().destroy();
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    
    var dd = new dialogClass("simple_progress_viewer", false, "600", "40");
    
    dd.setTitle(uiAction);
    dd.setPreference('sysparm_renderer_progress_title', "Export ");
    dd.setPreference('sysparm_export_set_id', exportSetId);
    dd.setPreference('sysparm_export_set_test_mode', testMode);
    dd.setPreference('sysparm_ajax_processor', 'ExportSetHelper');
    dd.render();

    dd.setPreference('sysparm_button_vew_export_history', translatedTextMap["View"] + " " + " Export History");
    
    dd.on("executionStarted", function(response) {
        workerId = response.responseXML.documentElement.getAttribute("answer");
    });
    
    dd.on("renderStatus", function() {
        // workerId has been set, exportSetRunId is not defined, get export set run sys_id.
        if (workerId && !exportSetRunId) {
            getExportSetRunId();
        }
    });
    
    dd.on("executionComplete", function(trackerObj) {
        deleteExportSetRunLink();
        var container = gel("container");
        if (trackerObj && container) {
            if(trackerObj.state){
                var resultViewPanel = getResultView(trackerObj.state);
                container.replace(resultViewPanel);
            }
        }
        
        var viewExportHistory = gel("sysparm_button_vew_export_history");
        if (viewExportHistory) {
            viewExportHistory.onclick = function() {
                location.href = "/sys_export_set_run.do?sys_id=" + exportSetRunId;
            };
        }
    });
    
    function getExportSetRunId() {
        var ga = new GlideAjax("ExportSetHelper");
        ga.addParam("sysparm_name", "getExportSetRunId");
        ga.addParam("sysparm_export_set_worker_id", workerId);
        ga.addParam("sysparm_export_set_id", exportSetId);
        //and add link to Export History
        ga.getXML(addExportSetRunLink);
    }
    
    function addExportSetRunLink(response) {
        exportSetRunId = response.responseXML.documentElement.getAttribute("answer");
        if (exportSetRunId) {
            var containerDiv = document.querySelector("#container").parentNode;
            var linkTemplate = getLinkTemplate();
            var linkHTML = new Template(linkTemplate).evaluate({
                exportSetRunId: exportSetRunId
            });
            var linkElem = cel('div');
            linkElem.innerHTML = linkHTML;
            containerDiv.appendChild(linkElem);
        }
    }
    
    function deleteExportSetRunLink() {
        var linkMsgElem = document.querySelector("#link_msg");
        if (linkMsgElem && linkMsgElem.parentNode) {
            linkMsgElem.parentNode.removeChild(linkMsgElem);
        }
    }
    
    function getResultView(state) {
        var resultViewTemplate = getResultViewTemplate();
        
        if (state == "2") {
            this.statusIcon = "images/progress_success.png";
            this.status = translatedTextMap["Success"];
            this.statusMsg = exportSetName + " " + translatedTextMap["is exported"];
            this.statusIndicator = "#23D647";
        } else if (state == "3") {
            this.statusIcon = "images/progress_failure.png";
            this.status = translatedTextMap["Failure"];
            this.statusMsg = exportSetName + " " + translatedTextMap["is not exported"] + ". "+ translatedTextMap["Click"] + " '" + translatedTextMap["View"] + " Export History' " + translatedTextMap["to see"] +  " Export Log.";
            this.statusIndicator = "red";
        }
        
        var resultViewHTML = new Template(resultViewTemplate).evaluate({
            statusIcon: this.statusIcon,
            status: this.status,
            statusIndicator: this.statusIndicator,
            statusMsg: this.statusMsg
        });
        
        var resultViewElem = cel("div");
        resultViewElem.innerHTML = resultViewHTML;
        return resultViewElem;
    }
    
    function getLinkTemplate() {
        return '<div style="padding-top:10px;">' +
        '   <p id="link_msg" align="center">' +
        '   </b>' + translatedTextMap["Export can take long time"] +",  " + translatedTextMap["view status in"] + '$[SP]<a id="export_set_run" href="/sys_export_set_run.do?sys_id=#{HTML:exportSetRunId}">Export History</a>' +
        '   </p>' +
        '</div>';
    }
    
    function getResultViewTemplate() {
        return '<div style="margin-top:10px;margin-left:10px;margin-right:10px;"><img style="margin-right:5px" src="#{HTML:statusIcon}" title="#{HTML:status}"></img>' +
        '<span style="font-size:120%;color:#{HTML:statusIndicator}">#{HTML:status}</span>' +
        '<br></br>' +
        '<div style="marginTop:10px;">#{HTML:statusMsg}</div></div>';
    }
}
