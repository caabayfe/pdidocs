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

    const tms = api.state.tms; // Translated messages (tms)
    const API = {
        DO_MANUAL_CONF: 'doManualConfiguration'
    };
    const ALLOWED_USER_COUNT = 500;
    const uiUtil = imports['global.SGTUIUtil'](api);
    const msaProps = api.state.msaProps;

    const fnMap = {
        button_manual_conf: openScanModal,
        msa_button_next: nextButtonHandler,
        msa_button_cancel: closeScanModal,
        get_CSWGroupMembers: getCSWGroupMembers,
        msa_multi_typeahead: userSelectionHandler,
        msa_alert: alertHandler,
        sgt_data_broker: SGTDataBrokerHandler
    };

    const fn = fnMap[event.elementId] || fnMap[event.name];
    if (fn)
        fn();

    // --------------------  EVENT HANDLERS -------------------- //

    function openScanModal() {
        _updateProps({
            opened: true,
            errorMessage: '',
            selectedUserList: [],
            userListComponentError: [],
            disableAction: false,
            disableNextButton: false
        });
        _openOrCloseScanModal(true);
    }

    function nextButtonHandler() {
        _updateProps('errorMessage', '');
        if (msaProps.selectedUserList.length == 0) {
            _updateProps('userListComponentError', getUserListComponentError(tms.noUserSelected));
            return;
        }

        let userIdList = msaProps.selectedUserList.map(u => u.id);

        uiUtil.showLoader(tms.scheduling);
        _updateProps('disableAction', true);
        uiUtil
            .newDataBroker()
            .addRequest(API.DO_MANUAL_CONF, userIdList)
            .execute();
    }

    function closeScanModal() {
        _updateProps('opened', false);
        _openOrCloseScanModal(false);
    }

    function getCSWGroupMembers() {
        var data = api.data.get_CSWGroupMembers.output.data.GlideRecord_Query.sys_user_grmember._results;
        let list = data.map(user => ({
            id: user.user._reference.sys_id.value,
            label: user.user._reference.name.displayValue
        }));
        _updateProps('userList', list);
        api.data.get_CSWGroupMembers.output.data.GlideRecord_Query.sys_user_grmember = null;
    }

    function userSelectionHandler() {
        _updateProps('errorMessage', '');
        if (event.name === "NOW_TYPEAHEAD_MULTI#VALUE_SET") {
            if (event.payload.value !== '') {
                _updateProps({
                    grMemberSearchKey: event.payload.value,
                    userList: []
                });
                api.data.get_CSWGroupMembers.refresh();
            }
            return;
        }

        let dontAllow = event.payload.value.length > ALLOWED_USER_COUNT;

        _updateProps({
            userListComponentError: dontAllow ?
                getUserListComponentError(tms.allowedUserCountForManualScan) : [],
            selectedUserList: event.payload.value,
            disableNextButton: dontAllow
        });
    }

    function alertHandler() {
        _updateProps('errorMessage', '');
    }

    function SGTDataBrokerHandler() {
        uiUtil.hideLoader();
        if (event.name === 'DATA_OP_FAILED') {
            _updateProps({
                errorMessage: tms.serverError,
                disableAction: false
            });
            return;
        }
        const output = event.payload.data.output;
        switch (output[0].action) {
            case API.DO_MANUAL_CONF:
                helpers.navigate.to("manage-conditional-script-writers", {
                    scanID: output[0].result
                });
                closeScanModal();
                break;
        }
    }

    // --------------------  INTERNAL FUNCTIONS -------------------- //

    function getUserListComponentError(message) {
        return [{
            content: message,
            status: 'critical',
            icon: 'circle-info-fill'
        }];
    }

    function _updateProps(attrs, value) {
        uiUtil.setObjectState('msaProps', attrs, value);
    }

    function _openOrCloseScanModal(showModal) {
        api.emit('MODAL_SELECTED', {
            modalId: "[component-id$='manage_scripting_access_modal']",
            showModal: showModal
        });
    }

}
