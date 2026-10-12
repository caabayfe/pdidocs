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
    const BUTTON_NEXT = "next";
    const typeaheadConf = api.state.typeaheadConf;

    const simUtil = imports["sn_access_analyzer.AccessSimulatorUtil"](api, helpers);
    const subPageHandler = imports["sn_access_analyzer.GuidedExperienceSubPageHandler"](api, helpers);
    const thController = imports["sn_access_analyzer.TypeaheadController"](typeaheadConf, api, helpers);
    const SubPageEvent = subPageHandler.SubPageEvent;
    const gvar = api.state.gvar; // Global Variable
    const translatedMessage = api.state.translatedMessage;
    
    function onPageCloseRequest(request) {
        subPageHandler.hidePageError();
        let validationResult = thController.validate();
        
        gvar.validationResult = validationResult;
        gvar.pageCloseRequest = request;
        
        if (!validationResult.hasError) {
            requestServerSideValidation(validationResult);
        }
    }

    function generateTypeaheadData(typeaheads) {
        return {
            user: parseRequest(typeaheads[USER_TYPEAHEAD]),
            table: parseRequest(typeaheads[TABLE_TYPEAHEAD]),
            record: parseRequest(typeaheads[RECORD_TYPEAHEAD]),
            field: parseRequest(typeaheads[FIELD_TYPEAHEAD]),
            [api.state.pageParams.action.includes("role") ? "role" : "group"]: parseRequest(typeaheads[GROUP_ROLE_TYPEAHEAD])
        };
    }

    function parseRequest(item) {
        return {
            id: item.id,
            label: item.label,
            sublabel: item.sublabel
        };
    }

    function requestServerSideValidation(validationResult) {
        subPageHandler.showLoader(translatedMessage.validating);
        subPageHandler.disableButtons(BUTTON_NEXT);
        let th = validationResult.typeaheads;

        thController.updateProps(GROUP_ROLE_TYPEAHEAD, "serverError", null);

        simUtil.getSimulatedResult(
            "simulatorDB",
            th[USER_TYPEAHEAD].id,
            th[TABLE_TYPEAHEAD].sublabel || "incident",
            th[RECORD_TYPEAHEAD].id,
            th[FIELD_TYPEAHEAD].id,
            simUtil.getApiAction(api.state.pageParams.action),
            [th[GROUP_ROLE_TYPEAHEAD].id]);
    }

    function simulatorDataBrokerResponseHandler() {
        subPageHandler.enableButtons(BUTTON_NEXT);
        if (simUtil.hasServerError(event)) {
            subPageHandler.showPageError();
            return;
        }
        let req = event.payload.data.output.request;
        let res = event.payload.data.output.result;
        switch (req.action) {
            case "getSimulatedResult":
                serverValidationResponseHandler(res);
                break;
            case "isInheritedRole":
                thController.clearUpdateState();
                // if it is inherited role, dont close, before that, we have to show warning message
                closePage(res);
                break;
        }
    }

    function serverValidationResponseHandler(res) {
        gvar.simulatedResult = res;
        let vResult = gvar.validationResult;
        let typeaheads = vResult.typeaheads;

        if (res.error > 0) {
            let err = typeaheadConf.typeaheads[GROUP_ROLE_TYPEAHEAD].errors;
            let msgMap = {
                "Directly assigned roles cannot be added": err.existingRole,
                "Conflicting roles!": err.conflictingRoles,
                "Inherited roles cannot be removed": err.inhRoleCantRemove,
                "Role doesn't exist": err.roleDoesntExist,
                "Existing group cannot be assigned": err.cantAssignExistingGroup,
                "Group not available for the user": err.groupDoesntExist
            };
            for (let id in msgMap) {
                if (res.errorMessage.startsWith(id)) {
                    thController.showError(GROUP_ROLE_TYPEAHEAD, msgMap[id]);
                    thController.updateProps(GROUP_ROLE_TYPEAHEAD, "serverError", msgMap[id]);
                    vResult.hasError = true;
                    break;
                }
            }
        } else {
            storeData();
        }

        if (api.state.pageParams.action == "add-role") {
            subPageHandler.showLoader(translatedMessage.checkInhRole);
            helpers.timing.setTimeout(function() {
                api.data.simulatorDB.execute({
                    action: 'isInheritedRole',
                    payload: {
                        userSysId: typeaheads[USER_TYPEAHEAD].id,
                        roleSysId: typeaheads[GROUP_ROLE_TYPEAHEAD].id
                    }
                });
            }, 500);
            return;
        }

        thController.clearUpdateState();
        if(res.error > 0) {
            subPageHandler.hideLoader();
            return;
        }
        
        closePage();
    }

    function storeData() {
        subPageHandler.storeData({
            request: generateTypeaheadData(gvar.validationResult.typeaheads),
            simulatedResult: gvar.simulatedResult
        });
    }

    function closePage(showInhWarning) {
        subPageHandler.hideLoader();
        if (gvar.validationResult.hasError)
            return;

        if (showInhWarning) {
            helpers.modal.open("inhRoleModal");
        } else {
            subPageHandler.close(gvar.pageCloseRequest);
        }
    }

    function handleWarning() {
        if (event.name == "NOW_CONFIRM_MODAL#POSITIVE_BUTTON_CLICKED") {
            //setTimeout used here, since having issue in close modal window
            helpers.timing.setTimeout(() => subPageHandler.close(gvar.pageCloseRequest), 100);
        }
    }

    subPageHandler.onReceive(SubPageEvent.PAGE_CLOSE_REQUEST, onPageCloseRequest);
    subPageHandler.handle(event);

    simUtil.execute({
        simulatorDB: simulatorDataBrokerResponseHandler,
        inhRoleModal: handleWarning,
    }, event);

}
