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
    const uiUtil = imports['global.SGTUIUtil'](api);
    const srProps = api.state.srProps; //Schedule removal properties
    const tms = api.state.tms;

    const API = {
        SCHEDULE_FOR_REMOVAL: 'scheduleForRemoval'
    };

    const fnMap = {
        button_schedule_removal: showRemoveModal,
        srm_scheduled_time: scheduledTimeSelectionHandler,
        srm_button_confirm: scheduleRemoval,
        sgt_data_broker: SGTDataBrokerHandler,
        srm_button_cancel: () => _openOrCloseScanModal(false),
        alert: hideAlert
    };

    const fn = fnMap[event.elementId] || fnMap[event.name];
    if (fn)
        fn();

    // -------------------- Event Handlers -------------------- //

    function showRemoveModal() {
        var scriptedUsers = uiUtil.formatNumber(api.state.cswMembersCount.scriptedUsers);
        var notScriptedUsers = uiUtil.formatNumber(api.state.cswMembersCount.notScriptedUsers);
        var info = `${tms.usersToRemoveFromCSWGroup}: <b>${notScriptedUsers}</b><br>${tms.usersToKeepInCSWGroup}: <b>${scriptedUsers}</b>`;
        _updateProps({
            errorMessage: '',
            scheduledTime: '0',
            info: info
        });
        _openOrCloseScanModal(true);
    }

    function scheduledTimeSelectionHandler() {
        _updateProps('scheduledTime', event.payload.value);
    }

    function scheduleRemoval() {
        uiUtil.clearNotifications();
        uiUtil.showLoader(tms.scheduling);
        _updateProps('disableConfirmButton', true);
        uiUtil.newDataBroker()
            .addRequest(API.SCHEDULE_FOR_REMOVAL, {
                scanID: api.context.props.scanID,
                scheduledTime: srProps.scheduledTime
            })
            .execute();
    }

    function SGTDataBrokerHandler() {
        uiUtil.hideLoader();
        _updateProps('disableConfirmButton', false);
        if (event.name === 'DATA_OP_FAILED') {
            uiUtil.showErrorNotification(tms.serverError);
            return;
        }
        const output = event.payload.data.output;
        switch (output[0].action) {
            case API.SCHEDULE_FOR_REMOVAL:
                var result = output[0].result;
                if (result.error !== '') {
                    _updateProps('errorMessage', result.error);
                    return;
                }
                api.setState('removalJobScheduledOrRunning', true);
                _openOrCloseScanModal(false);
                helpers.navigate.to("home", null, {
                    src: 'removal-scheduled',
                    ts: Date.now()
                });
                break;
        }
    }

    function hideAlert() {
        _updateProps('errorMessage', '');
    }

    // -------------------- Internal Functions -------------------- //

    function _updateProps(attrs, value) {
        uiUtil.setObjectState('srProps', attrs, value);
    }

    function _openOrCloseScanModal(showModal) {
        api.emit('MODAL_SELECTED', {
            modalId: "[component-id$='schedule_removal_modal']",
            showModal: showModal
        });
    }

}
