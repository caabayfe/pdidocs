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
    const MILLISECONDS_IN_ONE_DAY = 86400000;
    const {
        encodeVAURIQuery
    } = imports['sn_ci_analytics.VAConditionBuilderEncoderUtils']();
    let query = null;
    const {
        startDate,
        endDate
    } = api.context.props;

    /*
    * Takes in the current date range and returns the end of date range in epoc format.
    * Compares milliseconds diff between current date range and adds that to epoc start date
    * to return the epoc end date.
    */
    const calculateActiveUserDateRangeEndInEpocFormat = (startDate, endDate) => {
        const startDateObject = new Date(startDate);
        const endDateObject = new Date(endDate);
        const differenceInMilliseconds = Math.abs(endDateObject - startDateObject) + MILLISECONDS_IN_ONE_DAY;
        const epocFormatStartDate = new Date('1970-01-01');
        const epocFormatEndDate = new Date(epocFormatStartDate.getTime() + differenceInMilliseconds);
        return epocFormatEndDate;
    };
    
    try {
        switch (event.elementId) {
            case 'active_user_list_navigate':
                query = encodeVAURIQuery([{
                    'field': 'Conversation Exists',
                    'operator': '',
                    'conditionValue': '',
                    'comparisonType': 'NEW_QUERY',
                    'children': [{
                        'field': 'Conversation Time',
                        'operator': 'is in the last',
                        'conditionValue': calculateActiveUserDateRangeEndInEpocFormat(startDate, endDate),
                        'comparisonType': 'IN_WHICH'
                    }]
                }]);
                break;
            default:
                throw 'invalid element';
        }
        if (query) {
            helpers.navigate.to('users', null, {
                startDate: api.context.props.startDate,
                endDate: api.context.props.endDate,
                encodedQuery: query
            });
        }
    } catch (e) {
        return false;
    }
}
