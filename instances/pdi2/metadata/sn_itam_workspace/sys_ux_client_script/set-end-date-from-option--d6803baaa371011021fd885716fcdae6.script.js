/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var option = api.state.options;
    var renStart = api.state.renStartDate;
    var format = api.context.session.user.dateFormat.toUpperCase();
    var internalFormat = "YYYY-MM-DD";
    const { NowDateTime } = imports['sn_uxf.core_libraries']();
    if(option != 'none' && renStart && NowDateTime(renStart, format, true).format() != 'Invalid Date'){
    var yearsToAdd = parseInt(option.split(" ")[0]);
    renStart = NowDateTime(renStart,format).format(internalFormat);
    var endDate = NowDateTime(renStart).add(yearsToAdd,'year').subtract(1,'day').format(format);
    api.setState("renEndDate",endDate);
    }
}
