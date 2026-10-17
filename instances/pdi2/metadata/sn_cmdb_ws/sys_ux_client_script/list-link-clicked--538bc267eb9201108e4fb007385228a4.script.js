/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
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
    const {
        handleReferenceLinkClickEvent
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    let {
        selectedCardFilter,
        cardFilters,
        tabs
    } = api.state;

    //if current tab is not certification tasks AND selected card is "Closed" , redirect to SRP
    let selectedCard = cardFilters.find(item => item.filter === selectedCardFilter);
    if(event.context.item.value.key != "certification_tasks" && selectedCard.key == 'closed') {
        //this is a temp workaround for DEF0683182 where users cannot properly see closed attestation or lifecycle tasks
        //for now, reroute them to standard record page
        //when task details page is enhanced to show all the details of closed tasks that aren't just certification tasks, remove this
        const {
            table,
            sys_id: sysId
        } = event.payload;
        let route = 'record';
        let params = {};
        let fields = {
            table,
            sysId
        };

        helpers.navigate.to(
            route, 
            fields, 
            params, 
            null, 
            null, 
            'current'
        );
    } else {
        handleReferenceLinkClickEvent({event, helpers});
    }
}
