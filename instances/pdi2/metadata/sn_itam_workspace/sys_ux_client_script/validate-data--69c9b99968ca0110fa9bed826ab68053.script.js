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
    var startDate = api.state.adjStartDate;
    var endDate = api.state.adjEndDate;
    var amount = api.state.adjAmount;
    var currency = api.state.currencyValues;

    api.setState("adjStartValid", true);
    api.setState("adjEndValid", true);
    api.setState("amountValidation", true);

    if (startDate && startDate != '') {
        startValidation = NowDateTime(startDate, format, true).format();
        if(startValidation == 'Invalid Date'){
           api.setState("adjStartValid", false);
        }
    }
    if(endDate && endDate !=''){
        endValidation = NowDateTime(endDate, format, true).format();
        if(endValidation == 'Invalid Date'){
           api.setState("adjEndValid", false); 
        }
    }

    if(amount && amount !=''){
        amount = amount.replace(',','');
        if(!(/^-?\d+$/.test(amount)) && !(/^-?[0-9]+\.[0-9]+$/.test(amount))){
            var sym = amount.substring(0, amount.indexOf(';'));
            var curr = Object.keys(currency);
            var baseAmount = amount.substring(amount.indexOf(';') + 1);
            var flag = curr.includes(sym) && ((/^-?\d+$/.test(baseAmount)) || (/^-?[0-9]+\.[0-9]+$/.test(baseAmount)));
            if(!flag)
                api.setState("amountValidation", false);
        }
    }

    var rateStartDate = api.state.rateStartDate;
    var rateEndDate = api.state.rateEndDate;
    var cost = api.state.cost;

    api.setState("rateStartDateValid", true);
    api.setState("rateEndDateValid", true);
    
    if (rateStartDate && rateStartDate != '') {
        startValidation = NowDateTime(rateStartDate, format, true).format();
        var response = [];
        if(startValidation == 'Invalid Date'){           
            response.push({
                "status": "critical",
                "content": "Expected format: " + format
            });
            event.context.item.value.start_date_valid = response;
            api.setState("rateStartDateValid", false);
        }else
            event.context.item.value.start_date_valid = response;
    }
    api.setState("rateStartDate", '');
    
    if(rateEndDate && rateEndDate !=''){
        endValidation = NowDateTime(rateEndDate, format, true).format();
        var response = [];
        if(endValidation == 'Invalid Date'){
            response.push({
                "status": "critical",
                "content": "Expected format: " + format
            });
            event.context.item.value.end_date_valid = response;
            api.setState("rateEndDateValid", false);
        } else
            event.context.item.value.end_date_valid = response;
    }

    api.setState("rateEndDate", '');
}
