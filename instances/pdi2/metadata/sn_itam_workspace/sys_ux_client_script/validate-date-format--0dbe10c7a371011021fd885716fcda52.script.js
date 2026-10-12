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
        NowDateTime
    } = imports['sn_uxf.core_libraries']();
    var startValidation = '';
    var endValidation = '';
    var format = api.context.session.user.dateFormat.toUpperCase();
    var startDate = api.state.renStartDate;
    var endDate = api.state.renEndDate;
    api.setState("renStartValid", true);
    api.setState("renEndValid", true);
    if (startDate && startDate != '') {
        startValidation = NowDateTime(startDate, format, true).format();
        if(startValidation == 'Invalid Date'){
           api.setState("renStartValid", false);
        }
    }
    if(endDate && endDate !=''){
        endValidation = NowDateTime(endDate, format, true).format();
        if(endValidation == 'Invalid Date'){
           api.setState("renEndValid", false); 
        }
    }
}
