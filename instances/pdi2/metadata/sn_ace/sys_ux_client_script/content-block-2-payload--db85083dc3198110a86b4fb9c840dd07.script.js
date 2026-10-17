/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const dummyContentBlockPayload = {
        type: {
            id: '1234'
        }
    };

    const recordContentBlockPayload = getRecordContentBlockPayload();
    if (!recordContentBlockPayload)
        return dummyContentBlockPayload;

    // Passing embedded help query to sn_ace_page record content block
    if (api.context.props.table === 'sn_ace_page') {
        const {
            appRoute,
            pageName,
            pagePath
        } = api.data.embedded_help_fields.output;
        const embeddedHelpQuery = `app_route=now/${ api.data.embedded_help_fields.output.appRoute}^status=published^context=${ api.data.embedded_help_fields.output.pagePath}`;
        const currentQuery = recordContentBlockPayload.props_details.query;
        recordContentBlockPayload.props_details.query = currentQuery || embeddedHelpQuery;
    }

    function getRecordContentBlockPayload() {
        const {
            pageContentBlockData
        } = api.state;

        return pageContentBlockData && pageContentBlockData[0] && pageContentBlockData[0].children[1] ? pageContentBlockData[0].children[1] : null;
    }

    return recordContentBlockPayload;
}
