/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        output
    } = event.payload.data;

    api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
        loading: false,
    });
    if (output.success) {
        const {
            startDate,
            endDate
        } = api.context.props;
        helpers.navigate.to('funnel-details', {
            funnelId: output.funnelId,
        }, {
            startDate,
            endDate,
            timestamp: Date.now()
        });
        api.setState('errorMessage', '');
    } else {
        // Todo: Error handling
        switch (output.status) {
            case 'DUPLICATE_NAME':
                api.setState('errorMessage', api.data.analytics_locale_get_list_1.output.duplicateNameError);
                break;
            case 'REQUEST_TRANSFORM_ERROR':
            case 'APPSEE_RESPONSE_ERROR':
            case 'INSUFFICIENT_PERMISSIONS':
                console.log("Error in Funnel creation", output); 
                api.setState('errorMessage', output.message);

        }
    }


}
