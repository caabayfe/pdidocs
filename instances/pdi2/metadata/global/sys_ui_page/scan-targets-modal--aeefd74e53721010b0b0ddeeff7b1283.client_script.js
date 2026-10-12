var selectedScanTargets = [];
var radioSelected = '';

function onScanTargetsChange(e) {
    selectedScanTargets = e.val;
}

function executeButtonAction() {
    // get params set on modal preferences
    var scanTargetsModal = GlideModal.prototype.get('scan_targets_modal');
    var g_form = (typeof g_form == 'undefined') ? new GlideForm() : g_form;
    var suiteId = (typeof rowSysId == 'undefined') ? g_form.getUniqueValue() : rowSysId;

    var targetTable = '';
    switch (radioSelected) {
        case 'radio-app':
            targetTable = 'sys_scope';
            break;
        case 'radio-update-set':
            targetTable = 'sys_update_set';
            break;
    }

    switch (scanTargetsModal.getPreference('sysparm_action')) {
        case 'execute':
            executeScan(suiteId, targetTable);
            break;
        case 'schedule':
            scheduleScan(suiteId, targetTable);
            break;
    }
}

function getUsageExecuteEvent() {
    var event = '';
    switch (radioSelected) {
        case 'radio-app':
            event = 'suite_ui_scan_scoped_app';
            break;
        case 'radio-update-set':
            event = 'suite_ui_scan_update_set';
            break;
        case 'radio-full-instance':
            event = 'suite_ui_scan_full_instance';
            break;
    }

    return event;
}

function getUsageScheduleEvent() {
    var event = '';
    switch (radioSelected) {
        case 'radio-app':
            event = 'suite_ui_schedule_scoped_app';
            break;
        case 'radio-update-set':
            event = 'suite_ui_schedule_update_set';
            break;
        case 'radio-full-instance':
            event = 'suite_ui_schedule_full_instance';
            break;
    }

    return event;
}

function collectUsageMetric(event) {
    var ga = new GlideAjax('ScanAjaxProcessor');
    ga.addParam('sysparm_metric_event', event);
    ga.addParam('sysparm_name', 'collectUsageMetricWithParam');
    ga.getXML();
}

function executeScan(suiteId, targetTable) {
    collectUsageMetric(getUsageExecuteEvent());
    var ga = new GlideAjax('ScanAjaxProcessor');
    ga.addParam('sysparm_suite_sys_id', suiteId);
    ga.addParam('sysparm_target_table', targetTable);
    ga.addParam('sysparm_target_sys_ids', JSON.stringify(selectedScanTargets));
    ga.addParam('sysparm_name', 'executeSuiteScanWithTargets');
    ga.getXML(executeScanCallback);
}

function executeScanCallback(response) {
    cancelPage();

    ScriptLoader.getScripts('/scripts/ScanProgressViewerUtil.js', function() {
        var scanTitle = new GwtMessage().getMessage('Execute Suite Scan');
        var hspvUtil = new ScanProgressViewerUtil();
        hspvUtil.renderProgress(response, scanTitle);
    });
}

function scheduleScan(suiteId, targetTable) {
    collectUsageMetric(getUsageScheduleEvent());
    var ga = new GlideAjax('ScanAjaxProcessor');
    ga.addParam('sysparm_suite_sys_id', suiteId);
    ga.addParam('sysparm_target_table', targetTable);
    ga.addParam('sysparm_target_sys_ids', JSON.stringify(selectedScanTargets));
    ga.addParam('sysparm_name', 'getOrCreateCombo');
    ga.getXML(scheduleScanCallback);
}

function scheduleScanCallback(response) {
    var comboSysId = response.responseXML.documentElement.getAttribute('answer');
    window.location = "sysauto_scan.do?sys_id=-1&sysparm_query=combo=" + comboSysId;
}

function cancelPage() {
    GlideModal.get().destroy();
}

function toggleDisable(elementToEnable, elementToDisable) {
    $j("#" + elementToEnable).select2("enable");

    $j("#" + elementToDisable)
        .select2("disable")
        .select2("val", '', true);
}

function disableAllMultiSelects() {
    $j("#app")
        .select2("disable")
        .select2("val", '', true);

    $j("#update-set")
        .select2("disable")
        .select2("val", '', true);
}

function onRadioChange(e) {
    radioSelected = e.target.id;

    if (radioSelected === 'radio-app')
        toggleDisable('app', 'update-set');

    if (radioSelected === 'radio-update-set')
        toggleDisable('update-set', 'app');

    if (radioSelected === 'radio-full-instance')
        disableAllMultiSelects();
}

function setDefaultRadio() {
    radioSelected = 'radio-full-instance';
    $j('#radio-full-instance').prop('checked', true);
    disableAllMultiSelects();
}

addAfterPageLoadedEvent(function() {
    setDefaultRadio();
});
