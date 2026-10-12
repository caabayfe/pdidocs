function include({
    imports
}) {
    class HandleRecordPagePropagateActionSNC {

        static processParams(api, event, helpers) {
            var extraParams = {};
            if (api.state.sowRecordCtrlExtraParams)
                extraParams = {...api.state.sowRecordCtrlExtraParams};
            if (event.payload && event.payload.wrappedAction && event.payload.wrappedPayload) {
                if (event.payload.wrappedAction === 'selected_ci_propagation') {
                    extraParams['investigationSelectedCI'] = event.payload.wrappedPayload.selectedCI;
                } else if (event.payload.wrappedAction === 'set_playbook_params') {
                    if (event.payload.wrappedPayload.resetExtraParams)
                        extraParams['playbookExtraParams'] = 'query/actionExecutionId=';
                    else
                        extraParams['playbookExtraParams'] = event.payload.wrappedPayload.extraParamsQuery;
                }
            }
            api.setState('sowRecordCtrlExtraParams', extraParams);
        }
    }
    return HandleRecordPagePropagateActionSNC;
}
