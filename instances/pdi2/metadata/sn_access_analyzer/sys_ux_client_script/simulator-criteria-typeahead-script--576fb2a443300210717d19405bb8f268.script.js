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

    const USER_TYPEAHEAD = "userTypeahead";
    const TABLE_TYPEAHEAD = "tableTypeahead";
    const RECORD_TYPEAHEAD = "recordTypeahead";
    const FIELD_TYPEAHEAD = "fieldTypeahead";
    const GROUP_ROLE_TYPEAHEAD = "groupRoleTypeahead";
    const RECORD_MODAL = "recordModal";
    const BUTTON_NEXT = "next";
    const typeaheadConf = api.state.typeaheadConf;

    const simUtil = imports["sn_access_analyzer.AccessSimulatorUtil"](api, helpers);
    const thController = imports["sn_access_analyzer.TypeaheadController"](api.state.typeaheadConf, api, helpers);
    const subPageHandler = imports["sn_access_analyzer.GuidedExperienceSubPageHandler"](api);
    const aaUtil = imports["sn_access_analyzer.AccessanalyzerUIUtil"](api, helpers);

    const TypeaheadEvent = thController.TypeaheadEvent;
    const SubPageEvent = subPageHandler.SubPageEvent;
    let gvar = api.state.gvar || {};

    async function pageReadyHandler(refresh) {
        
        gvar.apiRequestCount = 0;
        subPageHandler.enableButtons(BUTTON_NEXT);
        simUtil.updateScreenStatus(false);

        let grTypeahead = typeaheadConf.typeaheads[GROUP_ROLE_TYPEAHEAD];
        let action = api.state.pageParams.action;

        if (action === "add-role" || action === "remove-role") {
            grTypeahead.table = "sys_user_role";
            grTypeahead.encodedSearchQuery = "nameSTARTSWITH%s";
        } else {
            grTypeahead.table = "sys_user_group";
            grTypeahead.encodedSearchQuery = "active=true^nameSTARTSWITH%s";
        }

        let params = api.context.props.payload.payload.pageParams;

        if (params.resource) {
            thController.updateConf(USER_TYPEAHEAD, "loadData", false);
            thController.updateConf(TABLE_TYPEAHEAD, "loadData", false);
            thController.updateConf(GROUP_ROLE_TYPEAHEAD, "loadData", false);
        }

        thController.init();
        thController.updateConf(RECORD_TYPEAHEAD, "table", "");
        thController.updateConf(FIELD_TYPEAHEAD, "table", "");

        if (params.resource) {
            
            helpers.timing.setTimeout(subPageHandler.showLoader, 1);
            let ans = await aaUtil.callAccessInsightsDB('base64Decode', params.resource);
            let res = JSON.parse(ans.executionResult.output.result);
            thController.update(USER_TYPEAHEAD, {
                id: res.user.id,
                label: res.user.label
            });
            thController.update(TABLE_TYPEAHEAD, {
                id: res.table.name,
                label: res.table.label,
                sublabel: res.table.name
            });

            thController.update(GROUP_ROLE_TYPEAHEAD, res.role || res.group);

            if(res.record.id) {
                thController.update(RECORD_TYPEAHEAD, {
                    id: res.record.id,
                    label: res.record.label
                });
            }
            if(res.field) {
                thController.update(FIELD_TYPEAHEAD, {
                    id: res.field.name,
                    label: res.field.label,
                    sublabel: res.field.name
                });
            }

            helpers.timing.setTimeout(subPageHandler.hideLoader, 10);
        }
    }

    function onTableMetadataFetchSucceeded() {
        if (simUtil.hasServerError(event)) {
            subPageHandler.showPageError();
            return;
        }
        let recConf = thController.getConf(RECORD_TYPEAHEAD);
        let displayCol = api.data.tableMDS.output.data.GlideRecord_Query[recConf.table]._table_metadata.displayValue;
        thController.updateConf(RECORD_TYPEAHEAD, {
            encodedSearchQuery: `${displayCol}STARTSWITH%s^ORDERBY${displayCol}`,
            displayColumnName: displayCol
        });
        thController.loadData(RECORD_TYPEAHEAD);
    }


    function onTypeaheadItemSelected(typeaheadID, item) {
        if (!item.id)
            return;
        simUtil.updateScreenStatus();
        if (typeaheadID != TABLE_TYPEAHEAD)
            return;
        let table = item.sublabel;
        let thConf = thController.getConf(RECORD_TYPEAHEAD);
        if (table != thConf.table) {
            thController.clear(RECORD_TYPEAHEAD, FIELD_TYPEAHEAD);
            thController.updateConf(RECORD_TYPEAHEAD, "table", table);
            thController.updateConf(FIELD_TYPEAHEAD, "table", table);
            api.data.tableMDS.refresh();
            thController.loadData(FIELD_TYPEAHEAD);
        }
    }

    function onRecordSelectedFromModalWindow() {
        helpers.modal.close(RECORD_MODAL);
        let sysId = event.payload.row.sys_id.value;
        let label = event.payload.row.displayValue.value;
        thController.update(RECORD_TYPEAHEAD, {
            id: sysId,
            label: label
        });
    }

    function openRecordWindow() {
        helpers.modal.open(RECORD_MODAL, {
            bare: true
        });
    }

    thController.addEventHandler(TypeaheadEvent.ON_SELECTED_ITEM_SET, onTypeaheadItemSelected);
    thController.addEventHandler(TypeaheadEvent.ON_DATA_FETCH_FAILED, subPageHandler.showServerError);
    thController.handle(event);

    subPageHandler.onReceive(SubPageEvent.PAGE_READY, pageReadyHandler);
    subPageHandler.handle(event);

    simUtil.execute({
        buttonOpenRecordWindow: openRecordWindow,
        recordModalWindow: onRecordSelectedFromModalWindow,
        tableMDS: onTableMetadataFetchSucceeded
    }, event);

}
