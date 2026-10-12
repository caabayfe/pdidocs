/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const eventName = event?.name;

    // Handle DATA_FETCH_SUCCEEDED events
    if (eventName === 'DATA_FETCH_SUCCEEDED' && event.elementId === 'error_stats') {
        setPageData();
    }
    // Handle pagination events
    else if (eventName === 'NOW_PAGINATION_CONTROL#SELECTED_PAGE_SET' ||
             eventName === 'NOW_PAGINATION_CONTROL#SELECTED_PAGE_SIZE_SET') {
        setPageData();
    }
    // Handle macroponent property changes
    else if (eventName === 'MACROPONENT_PROPERTY_CHANGED') {
        const propertyName = event.payload?.name;

        switch (propertyName) {
            case 'applicationSysId':
                api.data.error_code_kb_details.refresh();
                break;

            case 'filterQuery':
                break;

            case 'orderClause':
            case 'searchTerm':
                setPageData();
                break;
        }
    }
    // Handle initial load or other events
    else if (!event || eventName === 'COMPONENT_BOOTSTRAPPED') {
        setPageData();
    }
    // All else, recalculate without refresh data
    else {
        setPageData();
    }

    function setPageData() {
        const data = api.data.error_stats?.results || [];
        const searchTerm = api.state.searchTerm;
        const orderClause = api.state.sortBy;
        const pageSize = api.state.page_size_for_pagination || 10;
        let currentPage = api.state.current_page_for_pagination || 0;
        let filteredData = data;

        // Step 1: Apply search filter
        if (searchTerm?.trim()) {
            const searchLower = searchTerm.trim().toLowerCase();
            filteredData = data.filter(item => {
                const codeName = item.error_code?._reference?.name?.displayValue || '';
                const codeCode = item.error_code?._reference?.error_code?.displayValue || '';
                const category = item.error_category?.displayValue || '';

                return codeName.toLowerCase().includes(searchLower) ||
                       codeCode.toLowerCase().includes(searchLower) ||
                       category.toLowerCase().includes(searchLower);
            });
        }

        // Step 2: Apply sorting
        if (orderClause?.includes('|')) {
            const [sortField, sortDirection] = orderClause.split('|');
            const isAscending = sortDirection.toLowerCase() === 'asc';

            filteredData.sort((a, b) => {
                let valueA, valueB;

                switch (sortField.trim()) {
                    case 'error_count':
                        valueA = parseInt(a.error_count?.value) || 0;
                        valueB = parseInt(b.error_count?.value) || 0;
                        break;

                    case 'error_code':
                        valueA = a.error_code?._reference?.error_code?.value || '';
                        valueB = b.error_code?._reference?.error_code?.value || '';
                        break;

                    case 'error_code.severity':
                        const tempA = -parseInt(a.error_code?._reference?.severity?.value);
                        const tempB = -parseInt(b.error_code?._reference?.severity?.value);
                        valueA = isNaN(tempA) ? 999 : tempA;
                        valueB = isNaN(tempB) ? 999 : tempB;
                        break;

                    case 'error_category':
                        valueA = a.error_category?.displayValue || '';
                        valueB = b.error_category?.displayValue || '';
                        break;

                    default:
                        return 0;
                }

                // Compare values
                const comparison = typeof valueA === 'string' && typeof valueB === 'string'
                    ? valueA.localeCompare(valueB)
                    : valueA - valueB;

                return isAscending ? comparison : -comparison;
            });
        }

        // Step 3: Calculate pagination with edge case handling
        const totalRecords = filteredData.length;
        const totalPages = Math.ceil(totalRecords / pageSize);
        let startIndex = currentPage * pageSize;

        // Handle edge case where target offset is greater than total records
        if (startIndex >= totalRecords && totalRecords > 0) {
            const lastValidPage = Math.max(0, totalPages - 1);
            currentPage = lastValidPage;
            startIndex = currentPage * pageSize;
            api.setState('current_page_for_pagination', currentPage);
        }

        const endIndex = Math.min(startIndex + pageSize, totalRecords);
        const paginatedData = filteredData.slice(startIndex, endIndex);

        // Step 4: Set the result state
        api.setState('page_card_data', paginatedData);
        api.setState('count', totalRecords);
        api.setState('total_record_for_paginaton', totalRecords);
        api.setState('cards_empty_state', paginatedData.length === 0);
    }
}
