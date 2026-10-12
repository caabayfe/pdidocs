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
    var tabId = api.context.app.CitationsTabId;
    if(!tabId) return;
    var extraParamsProp = api.data.transformFormDataBrokerInputs.output.extraParamsProp;
    var citationPayloadStr = extraParamsProp && extraParamsProp.citationPayload;
    if (!citationPayloadStr || api.state.citationPayload === citationPayloadStr) return;

    var formsCitationPayload;
    try {
        formsCitationPayload = JSON.parse(citationPayloadStr);
    } catch (e) {
        return;
    }

    var fields = formsCitationPayload && formsCitationPayload.fields;
    var hasFields = Array.isArray(fields) && fields.length > 0;
    if (!hasFields) return;

    api.setState('citationPayload', citationPayloadStr);
	api.emit('NAV_ITEM_SELECTED', {
		route: "record",
		fields: {
			table: api.context.props.inputTable,
			sysId: api.context.props.inputSysId
		},
		 params: {
			query: api.context.props.inputQuery,
			extraParams: api.context.props.inputExtraParams,
			views: api.context.props.views,
			selectedTabIndex: api.context.props.selectedTabIndex,
			selectedTab: tabId
		}
	});
}
