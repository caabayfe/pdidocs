/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const TRIGGER_TYPE = {
        RUN_NOW: 'run_now',
        SCHEDULE: 'schedule'
    };

    const tms = api.state.tms; // Translated messages (tms)

    const API = {
        IS_ANY_JOB_SCHEDULED_RUNNING: 'isAnyJobScheduledOrRunning',
        ADD_DAYS: 'addDays',
        SCHEDULE_SCAN: 'scheduleScan'
    };

    const uiUtil = imports['global.SGTUIUtil'](api);

    const fnMap = {
        button_scan_for_user: scanForScriptingUserHandler,
        scan_modal_done: scheduleScan,
        scan_modal_cancel: closeScanModal,
        scan_modal_trigger_type: triggerTypeHandler,
        scan_modal_schedule_time: scheduleTimeSelectedHandler,
        scan_modal_not_scripted_in_days: notScriptedInDaysHandler,
        sgt_data_broker: SGTDataBrokerHandler
    };

    const fn = fnMap[event.elementId] || fnMap[event.name];
    if (fn)
        fn();

    // --------------------  EVENT HANDLERS -------------------- //

    function scanForScriptingUserHandler() {
        _updateScanProps('opened', true);
        api.data.users_in_conditional_script_writer_group.refresh();
        uiUtil.clearNotifications();
        uiUtil.showLoader(tms.loading);
        uiUtil.newDataBroker()
            .addRequest(API.IS_ANY_JOB_SCHEDULED_RUNNING)
            .addRequest(API.ADD_DAYS, {
                daysToAdd: 1
            })
            .execute();
    }

    function scheduleScan() {
        const scanProps = api.state.scanProps;
        const isScheduledSelected = scanProps.triggerType == TRIGGER_TYPE.SCHEDULE;

        if (isScheduledSelected && (scanProps.isScheduledTimeInvalid || !_isValidScheduledTime(scanProps.scheduledTimeValue))) {
            _showScheduledTimeError();
            return;
        }

        _updateScanProps('disableScanButton', true);
        uiUtil.showLoader(tms.scheduling);
        uiUtil.newDataBroker()
            .addRequest(API.SCHEDULE_SCAN, {
                scheduledTime: isScheduledSelected ? scanProps.scheduledTimeDisplayValue : '',
                notScriptedInDays: scanProps.notScriptedInDays
            }).execute();
    }

    function closeScanModal() {
        _updateScanProps('opened', false);
        _openOrCloseScanModal(false);
    }

    function triggerTypeHandler() {
        _updateScanProps('triggerType', event.payload.value);
    }

    function scheduleTimeSelectedHandler() {
        if (event.name == 'NOW_DATE_TIME#INVALID_SET') {
            if (event.payload.errorId.length > 0) {
                _updateScanProps('isScheduledTimeInvalid', true);
            }
            return;
        }
        let payload = event.payload;
        _updateScanProps({
            isScheduledTimeInvalid: false,
            scheduledTimeError: [],
            scheduledTimeDisplayValue: payload.value,
            scheduledTimeValue: payload.date.getTime()
        });
        if (!_isValidScheduledTime(payload.date.getTime())) {
            _showScheduledTimeError();
        }
    }

    function notScriptedInDaysHandler() {
        _updateScanProps('notScriptedInDays', event.payload.value);
    }

    function SGTDataBrokerHandler() {
        uiUtil.hideLoader();
        if (event.name == 'DATA_OP_FAILED') {
            _showServerError();
            return;
        }
        const output = event.payload.data.output;
        switch (output[0].action) {
            case API.IS_ANY_JOB_SCHEDULED_RUNNING:
                _openScanModal(output);
                break;
            case API.SCHEDULE_SCAN:
                closeScanModal();
                uiUtil.showSuccessNotification(tms.scanScheduled);
                break;
        }
    }

    // --------------------  INTERNAL FUNCTIONS -------------------- //

    function _updateScanProps(attrs, value) {
        uiUtil.setObjectState('scanProps', attrs, value);
    }

    function _isValidScheduledTime(timeStamp) {
        return timeStamp > Date.now();
    }

    function _openScanModal(data) {
        let isAnyJobScheduledOrRunning = data[0].result;
        let serverTime = data[1].result;
        _openOrCloseScanModal(true);
        _updateScanProps({
            notScriptedInDays: '180',
            isAnyJobScheduledOrRunning: isAnyJobScheduledOrRunning,
            scheduledTimeValue: serverTime.numericValue,
            scheduledTimeDisplayValue: serverTime.displayValue,
            triggerType: TRIGGER_TYPE.RUN_NOW,
            isScheduledTimeInvalid: false,
            scheduledTimeError: [],
            disableScheduleTime: [{
                before: serverTime.displayValue
            }]
        });
    }

    function _openOrCloseScanModal(showModal) {
        api.emit('MODAL_SELECTED', {
            modalId: "[component-id$='scan_modal']",
            showModal: showModal
        });
    }

    function _showScheduledTimeError() {
        _updateScanProps('isScheduledTimeInvalid', true);
    }

    function _showServerError() {
        closeScanModal();
        uiUtil.showErrorNotification(tms.serverError);
    }
}
