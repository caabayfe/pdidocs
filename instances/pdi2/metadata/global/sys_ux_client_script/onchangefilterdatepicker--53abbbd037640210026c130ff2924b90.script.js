/**
* On change of values in the date picker triggers an event 
* which in turn calls this client script
* 
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*
*/
function handler({api, event, helpers, imports}) {
    //adding to fix date offset issue in date picker iso
    let isoStart;
    let isoEnd;
    fixIsoDateOffset();
    event.payload["isoStart"] = isoStart.toISOString();
    event.payload["isoEnd"] = isoEnd.toISOString();
    setClientStates();

    /***
     *  Sets global state values
     *  State values can also trigger actions to those compoenents they bind to
     */
    function setClientStates() {
        api.setState("dateRangeSelected", {item: event.payload});
    }

    /***
     *  Set time to 00:00:00
     *  fix iso date string
     */
    function fixIsoDateOffset() {
        isoStart = new Date(event.payload["start"]);
        isoEnd = new Date(event.payload["end"]);
        isoStart.setUTCHours(0,0,0,0);
        isoEnd.setUTCHours(0,0,0,0);
    }
}
