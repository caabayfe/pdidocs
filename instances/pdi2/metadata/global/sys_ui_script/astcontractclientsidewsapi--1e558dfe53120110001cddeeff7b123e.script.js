function AstContractClientSideWSAPI() {
    function onChangeCalculateTaxAmount(applicableTaxField, paymentAmountField, taxRateField, taxCostField, totalCostField, gFormObject) {

        function ajaxResponse(serverResponse) {
            var result = serverResponse.responseXML.getElementsByTagName('result');
            gFormObject.setValue(taxCostField, result[0].getAttribute('currency') + ';' + result[0].getAttribute('taxCost'));
            gFormObject.setValue(totalCostField, result[0].getAttribute('currency') + ';' + result[0].getAttribute('amount'));
        }

        if (!applicableTaxField || !paymentAmountField || !taxRateField || !taxCostField || !totalCostField) {
            gFormObject.addErrorMessage('Please pass the field names for applicable taxes, payment amount, tax rate, tax cost and total cost');
        }

        var ga = new GlideAjax('ExpenseManagementUtilsAJAX');
        ga.addParam('sysparm_name', 'getTaxAmount');
        ga.addParam('sysparm_salesTax', gFormObject.getValue(applicableTaxField) === 'sales' ? 'true' : 'false');
        ga.addParam('sysparm_compoundAmount', gFormObject.getValue(paymentAmountField));
        ga.addParam('sysparm_taxRate', gFormObject.getDecimalValue(taxRateField));
        ga.getXML(ajaxResponse);
    }

    function calculateRenewalEndDateUsingOptions(renewal_options_field, start_date_field, end_date_field, gFormObject) {
        var ga = new GlideAjax('ContractManagementUtilsAJAX');
        ga.addParam('sysparm_name', 'calculateRenewalEndDatesUsingOptions');
        ga.addParam('sysparm_start_date', gFormObject.getValue(start_date_field));
        ga.addParam('sysparm_start_date_label', gFormObject.getLabelOf(start_date_field));
		ga.addParam('sysparm_end_date', gFormObject.getValue(end_date_field));
        ga.addParam('sysparm_end_date_label', gFormObject.getLabelOf(end_date_field));
        ga.addParam('sysparm_renewal_options', gFormObject.getValue(renewal_options_field));
        ga.getXML(function(serverResponse) {
			var output = serverResponse.responseXML.documentElement.getAttribute('answer');	
            outputDetails = JSON.parse(output);

            if (outputDetails && outputDetails.errorMessage) {
                gFormObject.addErrorMessage(outputDetails.errorMessage);
                gFormObject.clearValue(start_date_field);
            } else {
                var endDate = outputDetails.endDate;
				gFormObject.setValue(end_date_field, endDate);
            }
        });
    }

    function validateStartDateEndDate(startDateField, endDateField, gFormObject) {
        var ga = new GlideAjax('ContractManagementUtilsAJAX');
        ga.addParam('sysparm_name', 'validateStartEndDates');
        ga.addParam('sysparm_start_date', gFormObject.getValue(startDateField));
        ga.addParam('sysparm_start_date_label', gFormObject.getLabelOf(startDateField));
        ga.addParam('sysparm_end_date', gFormObject.getValue(endDateField));
        ga.addParam('sysparm_end_date_label', gFormObject.getLabelOf(endDateField));
        ga.getXML(function(serverResponse) {
            var validationError = serverResponse.responseXML.documentElement.getAttribute('answer');
            if (validationError && validationError != '') {
                gFormObject.addErrorMessage(validationError);
				if (validationError.includes(gFormObject.getLabelOf(endDateField))) {
					gFormObject.clearValue(endDateField);
				} else {
					gFormObject.clearValue(startDateField);
				}
            }
        });

    }

    return {
        onChangeCalculateTaxAmount: onChangeCalculateTaxAmount,
        calculateRenewalEndDateUsingOptions: calculateRenewalEndDateUsingOptions,
        validateStartDateEndDate: validateStartDateEndDate,
        type: 'AstContractClientSideWSAPI'
    };

}
