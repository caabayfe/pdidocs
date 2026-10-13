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
        encodeVAURIQuery
    } = imports['sn_ci_analytics.VAConditionBuilderEncoderUtils']();
    let query = null,
        extractedValue = '',
        paramedQuery = '';

    const VA_SUCCESS_FILTER_ID = "f06c48305314f010a86bddeeff7b1282";
    const CONST_SPLITTER = '^';
    const CONST_PROP_VALUE = 'property_value=';
    const _extractValueFromPARQuery = (parQuery) => {
        try {
            if (!parQuery) return null;
            return parQuery.match(/\^property_value=(.*?)([\^]|$)/)[1]; //extracts{value} from ...^property_value={value} or ...^property_value={value}^other_properties=...
        } catch (e) {
            return null;
        }
    };

    try {
        switch (event.elementId) {
            case 'go_to_conversations_vasuccess_tab_button':
                query = 'sys_id:' + VA_SUCCESS_FILTER_ID;
                break;
            case 'survey_result_widget':
            case 'conversation_state_chart':
                paramedQuery = event.payload.params.query;
                extractedValue = _extractValueFromPARQuery(paramedQuery);
                if (!extractedValue) return;
                query = encodeVAURIQuery([{
                    'field': event.elementId == 'conversation_state_chart' ? 'End State' : 'Feedback Result',
                    'operator': 'is any of',
                    'conditionValue': event.elementId == 'survey_result_widget' ? [extractedValue, extractedValue + ' '] : [extractedValue], //Adding extractedValue + ' ' is a temporary fix for the feedback whitespace issue.
                    'comparisonType': 'NEW_QUERY',
                }]);
                break;
            default:
                throw 'invalid element';
        }
        if (query) {
            helpers.navigate.to('conversations', null, {
                startDate: api.context.props.startDate,
                endDate: api.context.props.endDate,
                encodedQuery: query
            });
        }
    } catch (e) {
        return false;
    }
}
