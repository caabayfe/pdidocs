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
    const uiConstants = imports["sn_instance_clone.InstanceCloneUIConstants"]();
    const {
        name,
        payload
    } = event;

    function _buildQuery(searchTermInput, filterInput, dropdownInput) {
        const {
            searchTerm,
            filter,
            dropdownFilter
        } = api.state;

        let querySearchTerm = searchTermInput === null ? searchTerm : searchTermInput;
        let queryFilter = filterInput === null ? filter : filterInput;
        let queryDropdown = dropdownInput === null ? dropdownFilter : dropdownInput;

        if (queryDropdown && querySearchTerm) {
            querySearchTerm = querySearchTerm
                .split('^OR')
                .filter(part => !part.startsWith('source_instanceLIKE'))
                .join('^OR');
        }

        let queryString = '';

        if (queryFilter && queryDropdown && querySearchTerm) {
            queryString = `${queryFilter}^${queryDropdown}^${querySearchTerm}`;
        } else if (queryFilter && queryDropdown) {
            queryString = `${queryFilter}^${queryDropdown}`;
        } else if (queryFilter && querySearchTerm) {
            queryString = `${queryFilter}^${querySearchTerm}`;
        } else if (queryDropdown && querySearchTerm) {
            queryString = `${queryDropdown}^${querySearchTerm}`;
        } else if (queryFilter) {
            queryString = queryFilter;
        } else if (queryDropdown) {
            queryString = queryDropdown;
        } else if (querySearchTerm) {
            queryString = querySearchTerm;
        } else {
            queryString = '';
        }

        api.setState('customQuery', queryString);
        api.setState('startIndex', 0);
    }

    switch (name) {
        case uiConstants.EVENT.NOW_INPUT_VALUE_SET:
        case uiConstants.EVENT.NOW_INPUT_ENTER_KEYDOWN:
            const searchTermInput = payload.value || payload.fieldValue;
            const searchTermString = searchTermInput ?
                `request_idLIKE${searchTermInput}^ORstateLIKE${searchTermInput}^ORtarget_instanceLIKE${searchTermInput}^ORchange_numberLIKE${searchTermInput}^ORsource_instanceLIKE${searchTermInput}^ORscheduledLIKE${searchTermInput}^ORestimated_clone_durationLIKE${searchTermInput}^ORdurationLIKE${searchTermInput}` :
                '';
            api.setState('searchTerm', searchTermString);
            _buildQuery(searchTermString, null, null);
            break;

        case uiConstants.EVENT.SN_COMPONENT_FILTER_APPLIED_ITEMS:
            let filterQuery = '',
                firstUpdate = false;
            const appliedFilters = payload.appliedFilters;
            const values = appliedFilters[0].values;
            api.setState('parFilters', appliedFilters);

            if (!values || values.length === 0) {
                _buildQuery(null, '', null);
                break;
            }

            filterQuery = values.reduce((acc, cur) => {
                if (!firstUpdate) {
                    firstUpdate = true;
                    return acc + "state=" + cur;
                }
                return acc + '^OR' + "state=" + cur;
            }, '');

            api.setState('filter', filterQuery);
            _buildQuery(null, filterQuery, null);
            break;

        case uiConstants.EVENT.NOW_DROPDOWN_ITEM_SELECTED:
        debugger;
            const dropdownId = payload.value[0]; // get selected id
            let dropdownLabel = '';

            // Find corresponding label from items
            if (dropdownId && payload.items) {
                const matchedItem = payload.items.find(item => item.id === dropdownId);
                if (matchedItem) {
                    dropdownLabel = matchedItem.label;
                }
            }
            let dropdownQuery;
            if (dropdownLabel === 'All') {
                api.setState('dropdownFilter', '');
                dropdownQuery='';
            }else{
               dropdownQuery = dropdownLabel ? `instance_id=${dropdownId}` : '';
               api.setState('dropdownFilter', dropdownQuery);
            }
            _buildQuery(null, null, dropdownQuery);
            break;

        default:
            return;
    }
}
