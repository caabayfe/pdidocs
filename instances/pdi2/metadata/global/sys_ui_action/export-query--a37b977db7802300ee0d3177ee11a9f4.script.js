// UI Action: Show Some Progress
// Client: true
// Onclick: startExport(exportType)

var translator = new GwtMessage();
var map = translator.getMessages(["Success", "Failure","Query Exporter","Selected queries are exported successfully.","Query export failed."]);

function setResultView(state) {
	var view = new Element("div");

    var img = new Element("img");
    if (state == "2") {
        img.src = "images/progress_success.png";
        img.title = map["Success"];
    } else if (state == "3") {
        img.src = "images/progress_failure.png";
        img.title = map["Failure"];
    }
    img.style.marginRight = "5px";
    img.style['float'] = "left";
    view.appendChild(img);
    var nsp = new Element("span");
    nsp.style.fontSize = "120%";
    if (state == "2") {
        nsp.style.color = "#23D647";
        nsp.innerHTML = map["Success"];
    } else if (state == "3") {
        nsp.style.color = "red";
        nsp.innerHTML = map["Failure"];
    }
    view.appendChild(nsp);
    var br = new Element("br");
    view.appendChild(br);

    var msgCntr = new Element("div");
    msgCntr.style.marginTop = "10px";
    var msg = new Element("span");
    if (state == "2")
        msg.innerHTML = translator.format(map["Selected queries are exported successfully."]);
    else if (state == "3")
        msg.innerHTML = translator.format(map["Query export failed."]);
    msgCntr.appendChild(msg);
    view.appendChild(msgCntr);

    var container = $("container");
    var new_container = new Element("div");
    new_container.style.marginTop = "10px";
    new_container.style.marginRight = "10px";
    new_container.style.marginLeft = "20px";
    new_container.appendChild(view);
    container.replace(new_container);

}

/*
* function to download Query export and render UI with success/failure message.
*/
function downloadQueryExport(state, result) {
    if (state == "2") {
        var request = new XMLHttpRequest();
        var url = "export_update_set.do?sysparm_sys_id=" + result.exportSysId;

        request.open('GET', url, true);
        request.responseType = 'blob';
        request.setRequestHeader('X-UserToken', g_ck); //g_ck holds user CSRF token for the current session

        request.onload = function() {
            if (this.status === 200) {
                var blob = new Blob([this.response], {
                    type: 'application/xml'
                });

                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = 'qb_saved_query_updateset.xml';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                state = '2'; //success
                setResultView(state);
            } else {
                state = '3'; //failure
                setResultView(state);
            }
        };

        request.onerror = function() {
            state = '3'; //failure
            setResultView(state);
        };

        request.send();
    } else {
        setResultView(state);
    }


}

function setLogView(log) {
    var view = new Element("div");
    view.id = "view_log_container";
    view.style.height = "300px";
    view.style.overflowY = "scroll";
    view.style.border = "thin solid";
    view.style.marginTop = "10px";
    view.style.marginRight = "10px";
    view.style.marginLeft = "20px";
    view.style.whiteSpace = "pre";
    view.innerHTML = log;
    return view;
}

function displayProgressWorker(selectedList) {
    //instantiate new progress viewer
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    var dd = new dialogClass("hierarchical_progress_viewer", true, "40px", "105px");
    //give the window a title
    dd.setTitle(map["Query Exporter"]);
    //define the AJAX script include to call
    dd.setPreference('sysparm_ajax_processor', 'QueryExporterAjax');
    dd.setPreference('sysparm_ajax_processor_function', 'basic_export');
    dd.setPreference('sysparm_ajax_processor_query_list', selectedList);
    dd.setPreference('sysparm_button_close', 'Close');
    dd.setPreference('sysparm_button_logs', 'View Logs');
    dd.on("executionComplete", function(trackerObj) {
        var str = trackerObj.message || 'failed';
        // 2 for success and 3 for failure
        var result = str.include('Success!') ? '2' : '3';

        downloadQueryExport(result, trackerObj.result);
        var closeBtn = $("sysparm_button_close");
        if (closeBtn) {
            closeBtn.onclick = function() {
                dd.destroy();
            };
        }
        var logBtn = $("sysparm_button_logs");
        if (logBtn) {
            logBtn.onclick = function() {
                if (trackerObj) {
                    var footer = $("progressFooter");
                    var resultViewPanel = setLogView(trackerObj.result.exportResult);
                    footer.replace(resultViewPanel);
                }
            };
        }
    });

    //render the viewer
    dd.render();
}

function startExport() {
    this.selectedList = g_list.getChecked();
    displayProgressWorker(this.selectedList);
}

/**
 * A GlideDialogWindow with an OK button
 * @param title
 * @param question
 * @param onPromptComplete (Optional callback function pointer)
 * @return
 */
/*function gsftWarn(title, question, onPromptComplete) {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass('glide_warn', false);
	dialog.setTitle(title);
	dialog.setPreference('title', question);
	dialog.setPreference('onPromptComplete', onPromptComplete);
	dialog.render();
}*/
