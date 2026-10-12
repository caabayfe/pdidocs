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
    var curDate = NowDateTime().format(internalFormat);

    var adjAmount = api.state.adjAmount;
    var adjStartDate = api.state.adjStartDate;
    if(adjStartDate){
        adjStartDate = NowDateTime(adjStartDate,userFormat).format(internalFormat);
    }
    var adjEndDate = api.state.adjEndDate;
    if(adjEndDate){
        adjEndDate = NowDateTime(adjEndDate,userFormat).format(internalFormat);
    }

    var process = true;
    api.setState("errorMsg1","");
    api.setState("errorMsg2","");
    api.setState("errorMsg3","");

    if((adjEndDate && !adjStartDate)){
        helpers.translate("Start date must be specified").then(
            (value) => {
                api.setState("errorMsg1",value);
            }
        );
        process = false;      
    } else if(adjEndDate && adjStartDate &&  NowDateTime(adjEndDate).isBefore(adjStartDate)){
        helpers.translate("Start date can not be after the end date").then(
            (value) => {
                api.setState("errorMsg2",value);
            }
        );
        process = false;       
    }

    if(adjEndDate && NowDateTime(adjEndDate).isBefore(curDate)){
        helpers.translate("End date must be later than current time").then(
            (value) => {
                api.setState("errorMsg3",value);
            }
        );
         process = false;
    }
    
    if(process && api.state.adjStartValid && api.state.adjEndValid && api.state.amountValidation){
        if(!api.state.rateCard) {
            api.data.contract_adjustment.execute({
                "type": type,
                "sysId": sysId,
                "adjAmount": adjAmount,
                "adjStartDate": adjStartDate,
                "adjEndDate": adjEndDate
             });
        }
        else
        {
            api.setState("errorMsg4","");
            api.setState("errorMsg5","");
            api.setState("errorMsg6","");
            api.setState("errorMsg7","");
            var data = api.state.updateValues;
            var prop = Object.getOwnPropertyNames(data);
		    var length = prop.length;
		    for(var i = 0; i < length; i++){
                var record = data[prop[i]];
                var rateStartDate = record.start_date;
                if(rateStartDate)
                    rateStartDate = NowDateTime(rateStartDate,userFormat).format(internalFormat);
                var rateEndDate = record.end_date;
                if(rateEndDate)
                    rateEndDate = NowDateTime(rateEndDate,userFormat).format(internalFormat);

                if((rateEndDate && !rateStartDate)){
                    helpers.translate("Rate card start date must be specified").then(
                        (value) => {
                            api.setState("errorMsg4",value);
                        }
                    );
                    process = false;      
                } else if(rateEndDate && rateStartDate &&  NowDateTime(rateEndDate).isBefore(rateStartDate)){
                    helpers.translate("Rate card start date must be before rate card end date").then(
                        (value) => {
                            api.setState("errorMsg5",value);
                         }
                    );
                    process = false;       
                }

                if(adjStartDate && rateStartDate &&  NowDateTime(rateStartDate).isBefore(adjStartDate)){
                    helpers.translate("Due to contract, Rate card start date cannot be before " + adjStartDate).then(
                        (value) => {
                            api.setState("errorMsg6",value);
                         }
                    );
                    process = false;       
                }
                
                if(adjEndDate && rateEndDate &&  NowDateTime(adjEndDate).isBefore(rateEndDate)){
                    helpers.translate("Due to contract, Rate card end date cannot be after " + adjEndDate).then(
                        (value) => {
                            api.setState("errorMsg7",value);
                         }
                    );
                    process = false;       
                }
                if(!process)
                    break;

            }

            if(process && api.state.rateStartDateValid && api.state.rateEndDateValid)
            {
                api.data.contract_adjustment.execute({
                    "type": type,
                    "sysId": sysId,
                    "adjAmount": adjAmount,
                    "adjStartDate": adjStartDate,
                    "adjEndDate": adjEndDate,
                    "rateDetails": data,
                    "rate": true
                });
            }
        }
    }
}
