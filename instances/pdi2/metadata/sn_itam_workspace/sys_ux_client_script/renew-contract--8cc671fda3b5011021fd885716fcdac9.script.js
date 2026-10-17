/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { NowDateTime } = imports['sn_uxf.core_libraries']();
    var internalFormat = "YYYY-MM-DD";
    var userFormat = api.context.session.user.dateFormat.toUpperCase();
    var type = event.elementId;
    var sysId = api.context.props.sysId;
    var approver = api.state.approver;
    var adjType = (api.state.costAdjustType == 'none') ? '':api.state.costAdjustType;
    var options = (api.state.options == 'none') ? '':api.state.options;
    var adjPercent = api.state.costAdjustPercent;
    var adjAmount = api.state.costAdjustAmount;
    var curDate = NowDateTime().format(internalFormat);
    var renStartDate = api.state.renStartDate;
    if(renStartDate){
        renStartDate = NowDateTime(renStartDate,userFormat).format(internalFormat);
    }
    var renEndDate = api.state.renEndDate;
    if(renEndDate){
        renEndDate = NowDateTime(renEndDate,userFormat).format(internalFormat);
    }
    var contractStarts = api.state.starts;
    if(contractStarts){
        contractStarts = NowDateTime(contractStarts,userFormat).format(internalFormat);
    }
    var process = true;
    api.setState("errorMsg1","");
    api.setState("errorMsg2","");
    api.setState("errorMsg3","");
    if (!approver && type === "submit_review") {
        helpers.translate("Please choose an approver to review and approve your renewal contract").then(
            (value) => {
                api.setState("errorMsg1",value);
            }
        );
        process = false;
    }
    if((renEndDate&&!renStartDate) || (renEndDate && renStartDate &&  NowDateTime(renEndDate).isBefore(renStartDate))){
        helpers.translate("Start date can not be after the end date").then(
            (value) => {
                api.setState("errorMsg2",value);
            }
        );
        process = false;
        
    }else if(contractStarts && ((renStartDate && NowDateTime(renStartDate).isBefore(contractStarts))|| (options && !renStartDate))){
        helpers.translate("Please specify a Renewal start date after the contract start date").then(
            (value) => {
                api.setState("errorMsg2",value);
            }
        );
        process = false;
    }
    if(renEndDate && NowDateTime(renEndDate).isBefore(curDate)){
        helpers.translate("End date can not be before the current date").then(
            (value) => {
                api.setState("errorMsg3",value);
            }
        );
         process = false;
    }
    if(process && api.state.renStartValid && api.state.renEndValid){
    api.data.contract_renewal.execute({
        "type": type,
        "sysId": sysId,
        "approver": approver,
        "adjType": adjType,
        "options": options,
        "adjPercent": adjPercent,
        "adjAmount": adjAmount,
        "renStartDate": renStartDate,
        "renEndDate": renEndDate
    });
    }
}
