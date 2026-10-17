/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
 async function handler({
    api,
    event,
    helpers,
    imports
}) {

    const {
        props: {
            referenceTable,
            referenceField,
            table
        }
    } = api.context;

    const {
        fetchGlidelistData
    } = imports['sn_record_page.M2MListUXProcessor']();
    const {
        tempEncodedQuery,
        encodedQuery,
        searchBehaviour,
        searchTerm,
        displayColumn,
        selectedItems,
        tmpFilterCount
    } = api.state;

    let updateShowFilters = false;
    let searchFilter = "";
    let finalEncodedQuery = "";
    let searchTermValue = "";
    if (event.name == "SN_LIST_SELECTOR#SEARCH_TERM_SET") {
        searchTermValue = event.payload.value ? event.payload.value : event.payload.searchValue;

        api.setState("searchTerm", searchTermValue);
    } else {
        searchTermValue = searchTerm;
    }
    if (searchTermValue.length != 0) {
        if (searchBehaviour == "initial") {
            searchFilter = `${displayColumn}STARTSWITH${searchTermValue}`;
        } else {
            searchFilter = `${displayColumn}LIKE${searchTermValue}`;
        }
    }
    if (event.name == "NOW_BUTTON#CLICKED") {
        finalEncodedQuery = tempEncodedQuery;
        updateShowFilters = true;
        api.setState("encodedQuery", finalEncodedQuery);
        api.setState("isFilterQueryPartial", true);
        api.setState("isListLoading", true);
        api.setState("filterCount", tmpFilterCount);

    } else {
        finalEncodedQuery = encodedQuery;
    }
    const m2mSelectedList = selectedItems == null ? "" : selectedItems.flat().map(item => item.id).join(',');
    const filterQuery = finalEncodedQuery.length == 0 ? `^${searchFilter}` : `${finalEncodedQuery}^EQ^${searchFilter}`;
    const params = {
        sysparm_processor: "M2MList",
        sysparm_name: referenceTable,
        sysparm_chars: filterQuery,
        sysparm_nomax: true,
        sysparm_type: "M2MList",
        sysparm_field: `${table}.${referenceField}`,
        sys_target: table,
        m2m_selected_ids: m2mSelectedList
    };
    const data = await fetchGlidelistData(helpers, params);
    api.setState("availableItems", {
        glideListData: { ...data
        }
    });
    if (updateShowFilters) {
        api.setState("showFilters", false);
    }
    api.setState("isListLoading",false);
}
