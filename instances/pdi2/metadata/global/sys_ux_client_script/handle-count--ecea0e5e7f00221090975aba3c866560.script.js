/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    
    var allTables = api.context.props.allTables;
    var searchText = api.state.searchText;
    var count = 0;
    
    if(searchText && searchText.length && allTables) {
        searchText = searchText.toLowerCase();
        count = allTables.filter(table => table.label.toLowerCase().includes(searchText) || table.name.toLowerCase().includes(searchText)).length;
    } else if (allTables) {
        count = allTables.length;
    }
    api.setState("rowCount", count);
}
