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
    const eventErrors = event.payload.errors;
    let customErrorDefined = false;
    let apiStatus = {
            target: 'element',
            type: 'error'
        };
    if (api.state.dimensions instanceof Array && api.state.dimensions.length === 0) {
        /** 
         * The fetch elements failed due to non-availability 
         * of dimensions, which happens only if ACL restrictions 
         * prevent user from reading dimension, 
         * in this case we show a ACL restriction error
         */
        apiStatus = {
            target: 'filter',
            type: 'acl-error'
        };
    }  
    if (eventErrors instanceof Array && eventErrors.length > 0) {
        const status = eventErrors[0];
        if (status.detail) {
            if (status.detail === "50123") {
                customErrorDefined = true;
                api.setState('resetFilterElements', !api.state.resetFilterElements);
                api.setState("disabledFilters", "");
                helpers
                    .translate('Dimension is not evaluated for this date.')
                    .then((val) => {
                        apiStatus.type = "custom";
                        apiStatus.message = val;
                        api.setState('apiStatus', apiStatus);
                    });
            }
        }
    }

    if (!customErrorDefined)
        api.setState('apiStatus', apiStatus);

}
