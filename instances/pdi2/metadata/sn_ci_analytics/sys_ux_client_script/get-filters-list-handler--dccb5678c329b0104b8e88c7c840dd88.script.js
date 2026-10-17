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
    //once the filters load, check whether sys_id present in URL
    const {
        listType,
        encodedQuery
    } = api.context.props;

    const {
        output
    } = api.data.get_filters_list;

    function _isSelectedFilterIdValid(selectedFilterId) {
        if (output) {
            return output.findIndex(filter => filter.id === selectedFilterId) >= 0;
        }
        return false;
    }

    function clearFilter() {
        api.setState('comparisonModel', [{
            'comparisonType': 'NEW_QUERY',
            'field': '',
            'operator': '',
            'conditionValue': '',
            'tableName': listType == 'conversation' ? 'va_conversations' : 'va_users',
            'hideAndButton': false,
            'hideOrButton': false,
            'children': []
        }]);
        api.setState('isFilterLoading', true);
        const filterId = 'all';
        api.setState('selectedFilterId', filterId);
        api.data.load_filter.execute({
            filterId,
            listType
        });
        return true;
    }
    //Eg: .../encoded-query/sys_id:f06c48305314f010a86bddeeff7b1282
    const matches = (/^sys_id:(.*$)/g).exec(encodedQuery);
    if (matches) {
        const filterId = matches[1]; //extract the filterId
        if (filterId) { //case a: if filterId has some value
            if (output && _isSelectedFilterIdValid(filterId)) { //case a.a: if filterId is valid
                api.setState('isFilterLoading', true);
                api.setState('selectedFilterId', filterId);
                api.data.load_filter.execute({
                    filterId,
                    listType
                });
                return;
            } else { //case a.b: if filterId is invalid, reset to All
                return clearFilter();
            }
        } else { //case b: if filterId is blank. Eg. encoded-query/sys_id:
            return clearFilter();
        }
    }
    // if(!matches) do nothing
}
