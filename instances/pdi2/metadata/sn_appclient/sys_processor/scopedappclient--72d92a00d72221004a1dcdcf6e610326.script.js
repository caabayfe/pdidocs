var type = (g_request.getParameter("app_request_type")||'').toLowerCase();

var isAuthorized = false;

if (type == "install_and_update_apps" || type == "install_product" || type == "schedule") {
    isAuthorized = checkUserHasInstallRole();
} else {
    isAuthorized = checkUserHasReadRole();
}

if (isAuthorized) {
  switch (type) {
      case "list_apps":
          listApps();
          break;
      case "install_and_update_apps":
          installAndUpdateApps();
          break;
      case "install_product":
          installProduct();
          break;
      case "get_install_status":
          getInstallStatus();
          break;
      case "list_apps_versions":
          listAppsVersions();
          break;
      case "list_custom_apps":
          listCustomApps();
          break;
      case "get_dependency_status":
          getDependencyStatus();
          break;
      case "get_app_version_manifest":
          getAppVersionManifest();
          break;
      case "get_upgrade_history":
          getUpgradeHistory();
          break;
      case "get_store_filters":
          getStoreFilters();
          break;
      case "get_store_apps":
          getAllStoreApps();
          break;
      case "get_store_sync_status":
          isStoreSyncCompleted();
          break;
      case "entitle_app":
       entitleApp();
       break;
      case "get_products_data":
          getProductsData();
          break;
      case "subscribe_product":
          subscribeProduct();
          break;
      case "unsubscribe_product":
          unsubscribeProduct();
          break;
      case "get_store_app_detail":
          getStoreAppDetails();
          break;
      case "get_app_detail_for_purchase":
          getStoreAppDetails(true);
          break;
      case "get_store_app_review":
          getStoreAppReview();
          break;
      case "get_app_view_details_link":
          getAppViewDetailsLink();
          break;
      case "is_appstore_plugin":
          isAppstorePlugin();
          break;
      case "is_customization_enabled_upgrade":
          isCustomizationEnabledUpgrade();
          break;
      case "is_user_logged_in" :
          checkForStoreUserLogin();
          break;
      case "try":
          tryApp();
          break;
      case "request_trial":
          requestAppTrial();
          break;
      case "perform_get_purchase":
          performGetPurchase();
          break;
      case "request_app":
          performRequestApp();
          break;
      case "modify_quote":
          modifyQuote();
      case "complete_purchase":
          completePurchase();
          break;
      case "is_app_blocked_install":
          getLatestAppBlockStatus();
          break;
      case "get_pricing_details":
          getPricingDetails();
          break;
      case "request_quote":
          requestQuote();
          break;
      case "generate_purchase_transaction":
          generatePurchaseTransaction();
          break;
      case "submit_po":
          updatePOPurchaseTxn();
          break;
      case "upload_purchase_transaction_attachment":
          generatePurchaseTransactionAttachment();
          break;
      case "get_batch":
          getProductBatch();
          break;
      case "get_running_batch_install":
          getPendingBatchInstalls();
          break;
      case "needs_to_be_mapped":
          needsToBeMapped();
          break;
      case "schedule":
          processScheduleRequest();
          break;
      default:
          g_response.setStatus(400);
          gs.error("Unknown type: " + type);
    }
} else {
    gs.addErrorMessage(
        gs.getMessage("You do not have permission to perform this operation")
    );
    g_response.setStatus(403);
}

function checkUserHasInstallRole() {
    return (
        gs.hasRole("maint") ||
        gs.hasRole("admin") ||
        gs.hasRole("sn_appclient.app_client_user") ||
        gs.hasRole("sn_appclient.app_client_company_installer") ||
        gs.hasRole("delegated_developer")
    );
}

function checkUserHasReadRole() {
    return (
        gs.hasRole("maint") ||
        gs.hasRole("admin") ||
        gs.hasRole("sn_appclient.app_client_user") ||
        gs.hasRole("sn_appclient.app_client_company_installer") ||
        gs.hasRole("delegated_developer") ||
        gs.hasRole("unified_plugin_read_only") ||
        gs.hasRole("sn_g_app_creator.app_creator")
    );
}

function listApps() {
    var allApps = new AppsData();
    var data = allApps.getAllApps();
	var encodedResponse = new global.JSON().encode(data);
	g_processor.writeOutput("application/json", encodedResponse);
	g_response.setStatus(200);
}

function listCustomApps(){
    var allApps = new AppsData();
    var data = allApps.getCustomApps();
    var encodedResponse = new global.JSON().encode(data);
    g_processor.writeOutput("application/json", encodedResponse);
    g_response.setStatus(200);
}

function listAppsVersions() {
    var starttime = new GlideDateTime().getNumericValue();
	var allApps = new AppsData();
	var sharedInternally = g_request.getParameter("shared_internally") == "true";
	var isFirstLoad = g_request.getParameter("isFirstLoad") == "true";
	var hideOnUiAppScope = g_request.getParameter("hide_on_ui_app_scope");
	var data = allApps.getAllAppsWithVersions(sharedInternally, isFirstLoad, hideOnUiAppScope, g_request.getParameter("isFirstLoad") == null);
	var endtime = new GlideDateTime().getNumericValue();
	data.reporesponsetime = endtime - starttime;
	if(isFirstLoad){
		var collectionData = {};
		collectionData.type = "first_load";
		collectionData.time = (data.reporesponsetime/1000).toFixed(2);
		new AppClientGCFUtil().recordPageLoadAnalytics(collectionData);
	}

	var encodedResponse = new global.JSON().encode(data);
	g_processor.writeOutput("application/json", encodedResponse);
	g_response.setStatus(200);
}

function installAndUpdateApps() {
	var params = {};
	params.app_id = g_request.getParameter('app_id');
	params.version = g_request.getParameter('version');
	params.load_demo_data = g_request.getParameter('loadData');
	params.subscription = g_request.getParameter('subscription');
	params.isReinstall = g_request.getParameter('isReinstall');
	params.isInteractiveInstall = g_request.getParameter('is_interactive');
	params.customization_version = g_request.getParameter('customization_version');
	params.is_search_applied = g_request.getParameter('is_search_applied');
	params.is_filter_applied = g_request.getParameter('is_filter_applied');
	params.shared_internally = g_request.getParameter('shared_internally');
	
	var jsonResponse = new AppUpgrader().installAndUpdateApps(params);

	var encodedResponse = new global.JSON().encode(jsonResponse);
	g_processor.writeOutput("application/json", encodedResponse);
	g_response.setStatus(200);
}

function getPendingBatchInstalls() {
    var trackerObj = new ProgressTracker();
    var data = trackerObj.getPendingBatchInstalls();
    data = JSON.stringify(data);
    g_processor.writeOutput("application/json", data);
}

function installProduct(){
	var installationPlan = JSON.parse(g_request.getParameter('installation_plan')) || {};
	var response = new AppUpgrader().installProductByPlan(installationPlan);
	g_processor.writeOutput("application/json", JSON.stringify(response));
	g_response.setStatus(200);
}

function getInstallStatus() {
	var execId = g_request.getParameter('execId');
	var progressTracker = new ProgressTracker();
	var data = progressTracker.getStatus(execId);
	data = new global.JSON().decode(data);
	data.processedData = getPostInstallationData(data);
	data = new global.JSON().encode(data);
	gs.info(data);
	g_processor.writeOutput("application/json", data);
	g_response.setStatus(200);
}

function getProductBatch() {
	var batchId = g_request.getParameter('batchId');
	var progressTracker = new ProgressTracker();
	var data = progressTracker.getBatchInstallStatus(batchId);
	data = JSON.stringify(data);
	g_processor.writeOutput("application/json", data);
	g_response.setStatus(200);
}

function getDependencyStatus() {
    var appScope = g_request.getParameter("sysparm_app_scope");
	var mode = g_request.getParameter("mode");
    var requestData = g_request.getParameter("sysparm_data");
    requestData = new global.JSON().decode(requestData);
	var response;
	if (mode == 'batch'){
		response = new DependencyProcessor(null,true).processBatchDependencies(requestData);
	}
	else
		response = new DependencyProcessor(appScope).processDependency(requestData.split(","));
    var data = {};
    data.dependencies = response;
    var encodedResponse = new global.JSON().encode(data);
    g_processor.writeOutput("application/json", encodedResponse);
    g_response.setStatus(200);
}

function getAppVersionManifest(){
    var source_app_id=g_request.getParameter("sysparm_source_id");
    var version=g_request.getParameter("sysparm_version");
    var manifest = new ManifestService().getManifestForAppVersionSysId(source_app_id, version);
    var encodedResponse = new global.JSON().encode(manifest);
    g_processor.writeOutput("application/json", encodedResponse);
    g_response.setStatus(200);
}

function getUpgradeHistory(){
	var appId = g_request.getParameter("sysparm_app_id");
	gs.info("getUpgradeHistory() sysId of app/plugin : {0}", appId);
	var upgradeHistorySysId = new sn_appclient.AppUpgrader().getLatestUpgradeHistory(appId);
	var encodedResponse = new global.JSON().encode(upgradeHistorySysId);
	g_processor.writeOutput("application/json", encodedResponse);
}

function getStoreFilters(){
    var starttime = new GlideDateTime().getNumericValue();
    var data = new AppsData().getStoreFilters();
    var endtime = new GlideDateTime().getNumericValue();
    data.reporesponseTime = endtime - starttime;
    g_processor.writeOutput("application/json", new global.JSON().encode(data));
    g_response.setStatus(data.statusCode);
}

function getAllStoreApps() {
    var starttime = new GlideDateTime().getNumericValue();
    var allApps = new AppsData();
    var data = allApps.getAllStoreApps();
    var endtime = new GlideDateTime().getNumericValue();
    data.reporesponseTime = endtime - starttime;
    g_processor.writeOutput("application/json", new global.JSON().encode(data));
    g_response.setStatus(data.statusCode);
}

function isStoreSyncCompleted(){
    var response = new AppsData().isStoreSyncCompleted(g_request.getParameter("trackerId"));
    g_processor.writeOutput("application/json", new global.JSON().encode(response));
}

function entitleApp() {
	var sourceAppId = g_request.getParameter("source_app_id");
	var version = g_request.getParameter("version");
	var requestType = g_request.getParameter("request_type");
	if (requestType == 'get_subscribed_products')
		response = new AppsData().getSubscribedProductForApp(sourceAppId, version);
	else
		response = new AppsData().entitleApp(sourceAppId, version, requestType);
	g_processor.writeOutput("application/json", new global.JSON().encode(response));
	g_response.setStatus(response.statusCode);
}

function getProductsData() {
    var starttime = new GlideDateTime().getNumericValue();
    var allApps = new ProductsData();
    var data = allApps.getAllProducts();
    var endtime = new GlideDateTime().getNumericValue();
    data.reporesponseTime = endtime - starttime;
    g_processor.writeOutput("application/json", new global.JSON().encode(data));
    g_response.setStatus(data.statusCode);
}

function subscribeProduct() {
    var starttime = new GlideDateTime().getNumericValue();
    var allApps = new ProductsData();
    var data = allApps.subscribeProduct(g_request);
    var endtime = new GlideDateTime().getNumericValue();
    data.reporesponseTime = endtime - starttime;
    g_processor.writeOutput("application/json", new global.JSON().encode(data));
    g_response.setStatus(data.statusCode);
}

function unsubscribeProduct() {
    var starttime = new GlideDateTime().getNumericValue();
    var allApps = new ProductsData();
    var data = allApps.unsubscribeProduct(g_request);
    var endtime = new GlideDateTime().getNumericValue();
    data.reporesponseTime = endtime - starttime;
    g_processor.writeOutput("application/json", new global.JSON().encode(data));
    g_response.setStatus(data.statusCode);
}

function getStoreAppReview(){
	var appId = g_request.getParameter("application");
	var allApps = new AppsData();
	var data = allApps.getStoreAppReview(appId);
	var encodedResponse = new global.JSON().encode(data);
	g_processor.writeOutput("application/json", encodedResponse);
}

function getStoreAppDetails(forPurchase){
	var appId = g_request.getParameter("application");
	var version = g_request.getParameter("version");
	var allApps = new AppsData();
	var data = allApps.getStoreAppDetail(appId, version, forPurchase);
	var encodedResponse = new global.JSON().encode(data);
	g_processor.writeOutput("application/json", encodedResponse);
}

function getPostInstallationData(data) {
	if(data.state != "2" && data.state != "3")
		return;
	var appId = g_request.getParameter('app_id');
	var scope = g_request.getParameter('app_scope');
	var pluginId = g_request.getParameter('plugin_id');
	var isStoreApp = g_request.getParameter('is_store_app');
	var processedData = {};
	if (isStoreApp === 'false' && pluginId !== undefined && pluginId !== null)
		processedData.upgradeHistorySysId = new sn_appclient.AppUpgrader().getLatestUpgradeHistory(pluginId);
	else
		processedData.upgradeHistorySysId = new sn_appclient.AppUpgrader().getLatestUpgradeHistory(scope);

	if(data.state == 2) {
		if(scope == 'global') {
			processedData.numberOfConflictsForInstall = sn_gfiles.ClaimAPI.getNumberOfConflictsForInstall(appId);
			processedData.viewDetailsLink = sn_gfiles.ClaimAPI.getInstallConflictsViewDetailsLink(appId);
		}
		processedData.unmappedTableCount = GlideCustomTableUtils.getUnmappedTableCount('Application', appId);
		processedData.inventoryURI = GlideCustomTableUtils.getInventoryURI('Application', appId);
	}
	return processedData;
}

function getAppViewDetailsLink() {
	var apps = g_request.getParameter("apps");
	var appsData = new AppsData();
	apps.forEach(function(app) {
		app.view_details_link = "$allappsmgmt.do?view=store&application=" + app.source_app_id + "&version=" + app.version;
		app.latest_version = app.latest_version || app.version;
		appsData.updateAppStatusOnInstance(app);
	});
	g_processor.writeOutput("application/json", new global.JSON().encode(apps));
}

function isAppstorePlugin() {
	var source_app_id = g_request.getParameter("source_app_id");
	var appsData = new AppsData();
	var response = appsData.isAppstorePlugin(source_app_id);
	if (gs.nil(response))
		g_processor.writeOutput("application/json", new global.JSON().encode({"error" : "store app record not found"}));
	else
		g_processor.writeOutput("application/json", new global.JSON().encode({"isAppstorePlugin" : response}));
    g_response.setStatus(200);
}

function checkForStoreUserLogin() {
    var storeLoginResponse = new sn_appclient.AppClientAccess().
    isStoreSessionAlive(g_request.getParameter("username"), g_request.getParameter("password"));
    g_processor.writeJSON(storeLoginResponse);
    g_response.setStatus(200);
 }

function requestAppTrial() {
    var appSysId = g_request.getParameter("application_sys_id");
    var sourceAppId = g_request.getParameter("source_app_id");
    var storeTransaction = new StoreTransaction();
    var data = storeTransaction.requestAppTrial(appSysId, sourceAppId);
    var encodedResponse = new global.JSON().encode(data);
    g_processor.writeOutput("application/json", encodedResponse);
}

function tryApp() {
	var appSysId = g_request.getParameter("application_sys_id");
	var sourceAppId = g_request.getParameter("source_app_id");
	var storeTransaction = new StoreTransaction();
	var data = storeTransaction.tryApp(appSysId, sourceAppId);
	var encodedResponse = new global.JSON().encode(data);
	g_processor.writeOutput("application/json", encodedResponse);
}

function performGetPurchase() {
    var app_id = g_request.getParameter("app_id");
    var version = g_request.getParameter("version");
    var result = new StoreTransaction().performGetPurchase(app_id, version);
    var encodedResponse = new global.JSON().encode(result);
    g_processor.writeOutput("application/json", encodedResponse);
}
function performRequestApp() {
	var source_app_id = g_request.getParameter("app_id");
	var app_sys_id = g_request.getParameter("app_sys_id");
	var request_type = g_request.getParameter("request_type");
	var result = new StoreTransaction().performRequestApp(source_app_id, app_sys_id, request_type);
	var encodedResponse = new global.JSON().encode(result);
	g_processor.writeOutput("application/json", encodedResponse);
}
function modifyQuote() {
	var params = {};
	params.quote_sys_id = g_request.getParameter("quote_sys_id");
	params.action = g_request.getParameter("action");
	params.reason = g_request.getParameter("reason");
	params.source_app_id = g_request.getParameter("source_app_id");
	var result = new StoreTransaction().modifyQuote(params);
	var encodedResponse = new global.JSON().encode(result);
	g_processor.writeOutput("application/json", encodedResponse);
}
function completePurchase() {
	var completePurchaseArgs = new global.JSON().decode(g_request.getParameter("sysparm_data"));
	var result = new StoreTransaction().completeOfflinePurchase(completePurchaseArgs);
	var encodedResponse = new global.JSON().encode(result);
	g_processor.writeOutput("application/json", encodedResponse);
}
function needsToBeMapped() {
	var appsData = new AppsData();
	var result = false;

	// If this instance supports preinstall mapping, check if the app is mapped
	if (appsData.enforcePreinstallMapping())
		result = !appsData.isMapped(g_request.getParameter("app_id"));

	g_processor.writeOutput("application/json", new global.JSON().encode({"result": result}));
	g_processor.setStatus(200);
}
function getLatestAppBlockStatus() {
    var sourceAppId = g_request.getParameter("source_app_id");
    var version = g_request.getParameter("version");
    var response = new AppsData().getLatestAppBlockStatus(sourceAppId, version);
    var encodedResponse = new global.JSON().encode(response);
    g_processor.writeOutput("application/json", encodedResponse);
}
function requestQuote() {
	var params = {};
	params.data = g_request.getParameter("data");
	var result = new StoreTransaction().requestQuote(params);
	var encodedResponse = new global.JSON().encode(result);
	g_processor.writeOutput("application/json", encodedResponse);
}
function getPricingDetails() {
	var params = {};
	params.app_details = g_request.getParameter("app_details");
	var result = new StoreTransaction().getPricingDetails(params);
	var encodedResponse = new global.JSON().encode(result);
	g_processor.writeOutput("application/json", encodedResponse);
}
function generatePurchaseTransaction() {
	var result = new StoreTransaction().generatePurchaseTransaction();
	var encodedResponse = new global.JSON().encode(result);
	g_processor.writeOutput("application/json", encodedResponse);
}
function updatePOPurchaseTxn() {
	var params = {};
	params.po_details = g_request.getParameter("po_details");
	var result = new StoreTransaction().updatePOPurchaseTxn(params);
	var encodedResponse = new global.JSON().encode(result);
	g_processor.writeOutput("application/json", encodedResponse);
}
function generatePurchaseTransactionAttachment() {
	var params = {};
	params.attachmentIds = g_request.getParameter("attachmentIds");
	var result = new StoreTransaction().uploadAttachment(params);
	var encodedResponse = new global.JSON().encode(result);
	g_processor.writeOutput("application/json", encodedResponse);
}

function processScheduleRequest() {
	var scheduleService = new ScheduledInstallService();
	var requestParams = {};
	requestParams.action = g_request.getParameter("action");
	requestParams.schedule = g_request.getParameter("schedule");
	requestParams.schedule_id = g_request.getParameter("schedule_id");
	requestParams.source_app_id = g_request.getParameter("source_app_id");
	requestParams.scheduled_time = g_request.getParameter("scheduled_time");
	requestParams.appCount = g_request.getParameter("appCount");

	var response = scheduleService.processRequest(requestParams);
	g_processor.writeOutput("application/json", new global.JSON().encode(response.responseData));
	g_response.setStatus(response.statusCode);
}
function isCustomizationEnabledUpgrade() {
	var msgArray = [];
	var upgradeWarningMsg = '';
	var isTargetVersionUpdated = false;
	var isBaseAppVersionUnavailable = false;
	var appName = g_request.getParameter("appName");
	var customizedVersion = g_request.getParameter("customizedVersion");
	var selectedBaseVersion = g_request.getParameter("selectedBaseVersion");
	var customizedAppBaseVersion = g_request.getParameter("customizedAppBaseVersion");
	var customizedBaseAppExists = g_request.getParameter("customizedBaseAppAvailable");
	var pluginReleaseVersion = g_request.getParameter("pluginReleaseVersion");
	var isStoreApp = g_request.getParameter("isStoreApp");
	var installedVersion = g_request.getParameter("installedVersion");
	var updateAction = g_request.getParameter("updateAction");
	var installedCustomizedApp = g_request.getParameter("installedCustomizedApp");
	var displayWarning = false;
	if (isStoreApp === 'false' && (pluginReleaseVersion !== undefined || !gs.nil(pluginReleaseVersion))) {
		if (pluginReleaseVersion !== customizedAppBaseVersion) {
			msgArray.push(customizedAppBaseVersion);
			msgArray.push(pluginReleaseVersion);
			msgArray.push(customizedVersion);
			upgradeWarningMsg = gs.getMessage("warn_on_plugin_customization_install", msgArray);
			displayWarning = true;
		}
	} else {
		if (customizedBaseAppExists === 'true') {
			 if (customizedAppBaseVersion === selectedBaseVersion)  {
					msgArray.push(customizedVersion);
					msgArray.push(customizedAppBaseVersion);
					if (updateAction !== "undefined") {
						upgradeWarningMsg = gs.getMessage("warn_user_of_appcustomization_enabled_app_upgrade", msgArray);
						displayWarning = true;
					}
				} else {
					if (installedCustomizedApp !== customizedVersion) {
						msgArray.push(selectedBaseVersion);
						msgArray.push(customizedVersion);
						msgArray.push(customizedAppBaseVersion);
						upgradeWarningMsg = gs.getMessage("warn_user_of_appcustomization_upgrade_on_update_modal", msgArray);
						isTargetVersionUpdated = true;
					} else {
						msgArray.push(customizedVersion);
						msgArray.push(customizedAppBaseVersion);
						msgArray.push(selectedBaseVersion);
						upgradeWarningMsg = gs.getMessage("warn_on_base_app_upgrade_with_installed_customization", msgArray);
					}
					displayWarning = true;
				}
		} else if (customizedBaseAppExists === 'false') {
			if (selectedBaseVersion === installedVersion) {
				msgArray.push(customizedAppBaseVersion);
				msgArray.push(customizedVersion);
				msgArray.push(selectedBaseVersion);
				upgradeWarningMsg = gs.getMessage("warn_on_customized_base_app_version_unavailable", msgArray);
				displayWarning = true;
			} else {
				if (installedCustomizedApp !== customizedVersion) {
					msgArray.push(customizedAppBaseVersion);
					msgArray.push(customizedVersion);
					msgArray.push(selectedBaseVersion);
					msgArray.push(installedVersion);
					upgradeWarningMsg = gs.getMessage("warn_on_different_base_version_update", msgArray);
					isBaseAppVersionUnavailable = true;
				} else {
					msgArray.push(customizedVersion);
					msgArray.push(customizedAppBaseVersion);
					msgArray.push(selectedBaseVersion);
					upgradeWarningMsg = gs.getMessage("warn_on_base_app_upgrade_with_installed_customization", msgArray);
				}
				displayWarning = true;	
			}
		}
	}

	var data = {
		"isTargetVersionUpdated" : isTargetVersionUpdated,
		"upgradeWarningMsg" : upgradeWarningMsg,
		"isBaseAppVersionUnavailable" : isBaseAppVersionUnavailable,
		"displayWarning" : displayWarning
	};

	g_processor.writeOutput("application/json", new global.JSON().encode(data));
	g_response.setStatus(200);
}

function processError(g_processor, g_response, e){
	g_processor.writeOutput("application/json", new global.JSON().encode({"error" : e}));
	g_response.setStatus(400);
}

function processValidationFailure(g_processor, g_response, msg){
	g_processor.writeOutput("application/json", new global.JSON().encode({"error" : msg}));
	g_response.setStatus(400);
}
