function onCancel() {
	GlideDialogWindow.get().destroy();
}

function showLogs() {
	GlideDialogWindow.get().destroy();
	window.open("sys_upgrade_history.do?sysparm_query=sys_id=" + upgradeHistoryId, '_blank');
}

var progressMessage = gel('progressTxt');
var percentage_complete = gel('percentage_complete');
var progressBar = gel("progress-bar");
var progress = gel("progress");
var srOnlyProgress = gel("sronlyProgress");
var state = '';
var trackerId = '';
var app_name = gel("app_name").value;
var app_scope = gel("app_scope").value;
var closeInstallationBtn = gel("closeInstallation");
var viewLogsBtn = gel("view_logs");
var map = new GwtMessage().getMessages(['Progress']);
var upgradeHistoryId = '';

function repairApp(appSysId, version, customizationVersion, demodata, containsPlugins){
	var appV2Params = null;
	if (containsPlugins == 'true') {
		appV2Params = {};
		appV2Params.isJumboAppInstall = true;
	}
	
	var ga = new GlideAjax('AppUpgradeAjaxProcessor');
	ga.addParam('sysparm_name', 'install');
	ga.addParam("sysparm_scope","sn_appclient");
	ga.addParam("sysparm_app_sys_id",appSysId);
	ga.addParam("version",version);
	ga.addParam("customization_version",customizationVersion);
	ga.addParam("loadDemoData",demodata+"");
	if (appV2Params != null)
		ga.addParam("appV2Params", JSON.stringify(appV2Params));
	ga.getXMLAnswer(checkStatus);
}

function onRepair(){
	var confirmpopup = gel("confirmation_popup");
	confirmpopup.style.display = "none";
	var installationProgress = gel("installation_progress");
	installationProgress.style.display = "block";
	var app_sys_id = gel("app_sys_id").value;
	var version = gel("version").value;
	var customizationVersion = gel("customization_version").value;
	var containsPlugins = gel("contains_plugins").value;
	var demoData = false;
	var loadData = gel("load_demo");
	if(loadData){
		demoData = loadData.checked;
	}
	repairApp(app_sys_id,version,customizationVersion,demoData, containsPlugins);
}

function getMostRecentObjWithNonEmptyMessage(obj) {
        var mostRecentObj = obj;
        for (var i = 0; i < obj.results.length; i++) {
            var localMostRecent = getMostRecentObjWithNonEmptyMessage(obj.results[i]);
            var isMostRecent = (localMostRecent.updated_on > mostRecentObj.updated_on);
            var isSameTimestamp = (localMostRecent.updated_on == mostRecentObj.updated_on);
            if (isMostRecent || (isSameTimestamp && localMostRecent.state <= mostRecentObj.state)) {
                mostRecentObj = localMostRecent;
            }
        }
        return mostRecentObj;
}

function checkForUpgradeHistory(){
	var ga = new GlideAjax('AppUpgradeAjaxProcessor');
			ga.addParam('sysparm_name', 'isAppUpgradeHistoryExists');
			ga.addParam("sysparm_scope", "sn_appclient");
			ga.addParam("sysparm_app_scope", app_scope);
			ga.getXMLAnswer(function(upgradeHistorySysId) {
				if(upgradeHistorySysId && upgradeHistorySysId.length>0){
					viewLogsBtn.style.display = 'block';
					upgradeHistoryId = upgradeHistorySysId;
				}
			});
}

function checkStatus(data) {
	if(data)
	trackerId = data;
    if (state == 2 || state == 3) {
        return;
    }
    var ga = new GlideAjax('AppUpgradeAjaxProcessor');
    ga.addParam('sysparm_name', 'getInstallationStatus');
    ga.addParam("sysparm_scope", "sn_appclient");
    ga.addParam("trackerId", trackerId);
    ga.getXMLAnswer(function(dataProgress) {
		dataProgress = JSON.parse(dataProgress);
        state = dataProgress.state;
        if (state == 3) {
            progress.style['borderColor'] = 'red';
            progressBar.style['backgroundColor'] = 'red';
        }
		var dataItIS = getMostRecentObjWithNonEmptyMessage(dataProgress);
        progressMessage.innerHTML = dataItIS.message;
		if(state==1){
			percentage_complete.innerHTML = new GwtMessage().getMessage("{0} application is {1}% complete", app_name, dataProgress.percent_complete);
			closeInstallationBtn.style.display = "none";
			viewLogsBtn.style.display = 'none';
		}else{
			percentage_complete.innerHTML = '';
			closeInstallationBtn.style.display = "block";
			checkForUpgradeHistory();
		}
        progressBar.style.width = dataProgress.percent_complete + '%';
		progressBar.setAttribute("aria-valuenow", dataProgress.percent_complete);
		srOnlyProgress.innerHTML = map["Progress"]+" "+ dataProgress.percent_complete + '%';
        window.setTimeout(checkStatus, 500);
    });
}
