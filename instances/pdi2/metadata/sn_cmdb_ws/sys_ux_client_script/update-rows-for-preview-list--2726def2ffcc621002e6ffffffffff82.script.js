/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

        if (event.name === "NOW_PAGINATION_CONTROL#SELECTED_PAGE_SET") {
                api.setState('cmdbPreviewData', ({currentValue}) => {
                        return getPageDetails(currentValue, event.payload.value, currentValue.pageSize);
                });
        }
        // NOW_PAGINATION_CONTROL#SELECTED_PAGE_SIZE_SET
        else {
                api.setState('cmdbPreviewData', ({currentValue}) => {
                        return getPageDetails(currentValue, currentValue.currPageNumber, event.payload.value);
                });
        }

        function getPageDetails(currentValue, pageNum, pageSize) {
                const begin = pageNum * pageSize;
                const end = begin + pageSize;
                return {
                        ...currentValue,
                        ['currPageNumber']: pageNum,
                        ['pageSize']: pageSize,
                        ['currPageRows']: {"rows": currentValue.rows.rows.slice(begin, end)}
                };
        }
} 
