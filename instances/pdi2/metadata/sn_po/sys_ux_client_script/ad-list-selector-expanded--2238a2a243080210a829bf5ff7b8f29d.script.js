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
    const tableName = event.payload.item.reference;
   
    let selectedADTables = [...api.state.selectedADTables];
    if( event.payload.category == 'root' && selectedADTables.length > 0){
        const index = selectedADTables.indexOf('root');
        selectedADTables.splice(index+1);
        selectedADTables.push(tableName);
    }
    else if (selectedADTables.indexOf(tableName) >= 0 ) {
        const index = selectedADTables.indexOf(tableName);
        selectedADTables.splice(index+1);
    } 
    else {
        if(selectedADTables.indexOf('root') < 0){
            selectedADTables.push('root');
        }
        selectedADTables.push(tableName);
    }

    api.setState('selectedADTables',selectedADTables);

}
