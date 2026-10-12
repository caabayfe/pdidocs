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
    const comparator = new imports["sn_access_analyzer.AccessComparator"](api, helpers);
    const {
        addRequestInfo,
        navTo
    } = new imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);
    const {
        updateArrayState,
        emitActionPerformed
    } = new imports["sn_access_analyzer.AccessSimulatorUtil"](api, helpers);

    const IS_ACL_DETAIL_SCREEN = api.state.breadCrumbs.length == 3;

    const onScreenLoad = ({ 
        label,
        metadata
    }) => {
        emitActionPerformed('UPDATE_LIST', {
            index: 2,
            data: _getData(metadata)
        });
        _updateBreadCrumbs(label);
        _updateRequestInfo(true, label, metadata);
        api.setState('hideNote', true);
    };

    const breadCrumbItemClicked = () => {
        if (!IS_ACL_DETAIL_SCREEN) {
            return;
        }
        const stage = event.payload.item.stage;
        emitActionPerformed(stage == 1 ? 'LOAD_ALL_OPERATION' : 'LOAD_SINGLE_OPERATION', {
            forward: false,
            ...api.state.breadCrumbs[1]
        });
        _updateRequestInfo(false);
        api.setState('hideNote', false);
    };

    const _updateRequestInfo = (forward, label, metadata) => {
        if (forward) {
            const requestInfo = [...api.state.requestInfo];
            const last = requestInfo.pop();
            addRequestInfo(requestInfo, api.state.translatedMessages.acl_name, label, navTo('sys_security_acl', metadata.id));
            addRequestInfo(requestInfo, api.state.translatedMessages.decisionType, metadata.decisionType);
            addRequestInfo(requestInfo, api.state.translatedMessages.appliesToCondition, metadata.appliesToCondition);
            addRequestInfo(requestInfo, api.state.translatedMessages.empty, metadata.empty);
            requestInfo.push(last);
            api.setState('requestInfo', requestInfo);
        } else {
            api.setState('requestInfo', api.state.requestInfoDefault);
        }
    };
    const _updateBreadCrumbs = (label) => {
        const bc = [...api.state.breadCrumbs];
        updateArrayState('breadCrumbs', {
            label,
            name: label,
            stage: bc.length + 1,
            icon: 'key-outline',
            href: 'javascript:void(0);'
        });
    };

    const _getData = (metadata) => {
        const aclDetail = [];
        const presentData = metadata.baseUser;
        const simulatedData = metadata.modelUser;
        if (presentData) {
            _prepareACLDetail(aclDetail, 'present_status', presentData.acl);
        }
        if (simulatedData) {
            _prepareACLDetail(aclDetail, 'simulated_status', simulatedData.acl);
        }
        const result = comparator.getComparator("simulated_results_acl_detail", 'present_status', 'simulated_status').getComparisonResult(aclDetail);

        var translatedMessages = api.state.translatedMessages;
        result[0].name.value = translatedMessages.roles;
        result[1].name.value = translatedMessages.securityAttribute;
        result[2].name.value = translatedMessages.condition;
        result[3].name.value = translatedMessages.controlledByReferences;
        result[4].name.value = translatedMessages.script;

        return result;
    };

    const _prepareACLDetail = (aclDetail, type, {
        name,
        hasScript,
        rolesResult,
        securityAttributeResult,
        conditionResult,
        scriptResult,
        controlledByReferencesResult
    }) => {
        aclDetail.push({
            name,
            hasScript,
            rolesResult,
            securityAttributeResult,
            conditionResult,
            scriptResult,
            controlledByReferencesResult,
            category: type
        });
    };

    const handleEvent = ({
        eventName,
        eventPayload
    } = event.payload) => {
        if (eventName == 'LOAD_ACL_DETAIL') {
            onScreenLoad(eventPayload);
        }
    };
    let fnMap = {
        breadcrumbs: breadCrumbItemClicked,
        SIMULATOR_ACTION_PERFORMED: handleEvent
    };
    let fn = fnMap[event.elementId] || fnMap[event.name];
    if (fn) {
        fn();
    }
}
