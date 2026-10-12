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


    const ACTION_ADD_ROLE = "add-role";
    const ACTION_REMOVE_ROLE = "remove-role";
    const ACTION_ADD_GROUP = "add-group";
    const ACTION_REMOVE_GROUP = "remove-group";

    const simUtil = imports["sn_access_analyzer.AccessSimulatorUtil"](api, helpers);
    const subPageHandler = imports["sn_access_analyzer.GuidedExperienceSubPageHandler"](api);
    const SubPageEvent = subPageHandler.SubPageEvent;

    function onPageReady(payload) {
        let requestPayload = payload.dataSet.criteria.request;
        api.setState('requestPayload', requestPayload);
        _translateMessages(requestPayload);
        api.data.look_up_sim_settings.refresh();
    }


    const _translateMessages = (requestPayload) => {
    	subPageHandler.showLoader();
        let promises = [];
        let action = api.state.pageParams.action;
        switch (action) {
            case ACTION_ADD_ROLE:
                promises.push(helpers.translate('The role has been successfully added to the user. You can also use Access Analyzer to make sure they have the right access.'));
                promises.push(helpers.translate('Role'));
                promises.push(helpers.translate('Note: A user inherits roles from all groups they belong to. Roles can also be assigned directly to a user. However, a user will only have the newly assigned role after logging in with a new session.'));
                promises.push(helpers.translate('Add Role to user'));
                break;
            case ACTION_REMOVE_ROLE:
                promises.push(helpers.translate('The role has been successfully removed from the user. You can also use Access Analyzer to make sure they have the right access.'));
                promises.push(helpers.translate('Role'));
                promises.push(helpers.translate("Remove the user's access to a role. You can remove roles assigned directly to a user."));
                promises.push(helpers.translate('Remove Role from user'));
                break;
            case ACTION_ADD_GROUP:
                promises.push(helpers.translate('Job to add the user to the group has been queued. You can confirm this on the platform.'));
                promises.push(helpers.translate('Group'));
                promises.push(helpers.translate('Add user to a group to view their access permissions for a specific resource.'));
                promises.push(helpers.translate('Add user to the Group'));
                break;
            case ACTION_REMOVE_GROUP:
                promises.push(helpers.translate('Job to remove the user from the group has been queued. You can confirm this on the platform.'));
                promises.push(helpers.translate('Group'));
                promises.push(helpers.translate('Remove user from a group to view their access permissions to a specific resource.'));
                promises.push(helpers.translate('Remove user from the Group'));
                break;
        }
        promises.push(helpers.translate('Success!'));
        promises.push(helpers.translate('Skipped!'));
        promises.push(helpers.translate('The action has been omitted. You have the option to redo the simulation in order to take action or perform the same task on the platform.'));
        promises.push(helpers.translate('User'));
        promises.push(helpers.translate('Action'));
        promises.push(helpers.translate('Saving...')); // Index position - 9
        if (action.endsWith('role')) {
            promises.push(helpers.translate('The role that is selected for take action.')); // Index position - 10
        } else {
            promises.push(helpers.translate('The group that is selected for take action.')); // Index position - 10
        }

        Promise.all(promises).then(values => {

            api.setState('status', cxt => {

                let cv = { ...cxt.currentValue};
                
                cv.success.title = values[4];
                cv.success.message = values[0];

                cv.skip.title = values[5];
                cv.skip.message = values[6];
                
                cv.details = _populateErrorDetails(requestPayload, action, values[3], values[7], values[1], values[8]);
                cv.msgSaving = values[9];
                
                return cv;
            });

            simUtil.updateState('simulationInfoConfig', {
                simulationActionType: values[1],
                simulationBody: values[2],
                simulationHeading: values[3],
                simulationActionTooltip: values[10],
                userName: requestPayload.user.label,
                simulationActionName: [ACTION_ADD_ROLE, ACTION_REMOVE_ROLE].includes(action) ? requestPayload.role.label : requestPayload.group.label
            });

        });
    };


    const _populateErrorDetails = (requestPayload, action, simulationHeading, userLabel, actionType, actionLabel) => {
        let details = [
            _labelValueObj(userLabel, requestPayload.user.label),
            _labelValueObj(actionLabel, simulationHeading)
        ];
        if ([ACTION_ADD_ROLE, ACTION_REMOVE_ROLE].includes(action))
            details.push(_labelValueObj(actionType, requestPayload.role.label));
        else
            details.push(_labelValueObj(actionType, requestPayload.group.label));
        return details;
    };

    const _labelValueObj = (label, value) => {
        return {
            label: label,
            value: {
                type: 'string',
                value: value
            }
        };
    };

    subPageHandler.onReceive(SubPageEvent.PAGE_READY, onPageReady);
    subPageHandler.handle(event);

}
