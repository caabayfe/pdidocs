/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers1
 */
function evaluateProperty({
    api,
    helpers
}) {
    console.log("API" + JSON.stringify(api));
    if (api.context.props.payload.pageParams.channel == "teams" && api.data.look_up_records_2.results.length > 0) {
        return true;
    } else if (api.context.props.payload.pageParams.channel == "slack" && api.data.look_up_records_5.results.length > 0) {
        return true;
    } else if (api.context.props.payload.pageParams.channel == "messenger" && api.data.look_up_records_6.results.length > 0) {
        return true;
    } else if (api.context.props.payload.pageParams.channel == "line" && api.data.look_up_records_7.results.length > 0) {
        return true;
    } else if (api.context.props.payload.pageParams.channel == "google-chat" && api.data.google_chat_lookup_records.results.length > 0) {
        return true;
    }
}
