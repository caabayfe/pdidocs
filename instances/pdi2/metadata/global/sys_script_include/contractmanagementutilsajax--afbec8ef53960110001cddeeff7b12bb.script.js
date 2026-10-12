var ContractManagementUtilsAJAX = Class.create();
ContractManagementUtilsAJAX.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	_validateStartDate: function (startDate, startDateLabel) {
		if (!startDate) {
			return '';
		}
		var startDateInternal;
		try {
			startDateInternal = global.AssetUtils.getInternalDate(startDate,
				gs.getSession().getUser().getDateFormat()).getNumericValue();
		} catch (error) {
			return gs.getEscapedMessage('{0} is invalid', startDateLabel);
		}
		var currentDateInternal = new GlideDateTime().getLocalDate().getNumericValue();
		if (startDateInternal < currentDateInternal) {
			return gs.getEscapedMessage("{0} needs to be at least today's date", startDateLabel);
		}
		return '';
	},

	_validateEndDate: function (startDate, startDateLabel, endDate, endDateLabel) {
		if (!endDate) {
			return '';
		}
		var startDateInternal;
		var endDateInternal;
		var userDateFormat = gs.getSession().getUser().getDateFormat();
		if (startDate) {
			try {
				startDateInternal = global.AssetUtils.getInternalDate(startDate,
					userDateFormat).getNumericValue();
			} catch (error) {
				return gs.getEscapedMessage('{0} is invalid', startDateLabel);
			}
		}

		try {
			endDateInternal = global.AssetUtils.getInternalDate(endDate,
				userDateFormat).getNumericValue();
		} catch (error) {
			return gs.getEscapedMessage('{0} is invalid', endDateLabel);
		}

		var currentDateInternal = new GlideDateTime().getLocalDate().getNumericValue();

		if (gs.nil(startDateInternal) && endDateInternal <= currentDateInternal) {
			return gs.getEscapedMessage("{0} needs to be at least after today's date", endDateLabel);
		}

		if (!gs.nil(startDateInternal) && endDateInternal <= startDateInternal) {
			return gs.getEscapedMessage('{0} must be after {1}', [endDateLabel, startDateLabel]);
		}

		return '';
	},

	validateStartEndDates: function () {
		var startDate = this.getParameter('sysparm_start_date');
		var endDate = this.getParameter('sysparm_end_date');
		var startDateLabel = this.getParameter('sysparm_start_date_label');
		var endDateLabel = this.getParameter('sysparm_end_date_label');

		if (!startDate || !endDate) {
			return '';
		}

		var output = '';
		output = this._validateStartDate(startDate, startDateLabel);
		if (gs.nil(output)) {
			output = this._validateEndDate(startDate, startDateLabel, endDate, endDateLabel);
		}

		return output;
	},

	calculateRenewalEndDatesUsingOptions: function () {
		var output = {
			startDate: '',
			endDate: '',
			errorMessage: '',
		};

		var C_OPTION_MAPPING = {
			'1 year': {
				y: 1,
				m: 0,
				d: 0,
			},
			'2 years': {
				y: 2,
				m: 0,
				d: 0,
			},
			'3 years': {
				y: 3,
				m: 0,
				d: 0,
			},
		};

		var startDate = this.getParameter('sysparm_start_date');
		var startDateLabel = this.getParameter('sysparm_start_date_label');
		var renewalOptions = this.getParameter('sysparm_renewal_options');
		var endDate = this.getParameter('sysparm_end_date');
		var endDateLabel = this.getParameter('sysparm_end_date_label');
		var errors = '';
		if (!startDate) {
			return JSON.stringify(output);
		}
		errors = this._validateStartDate(startDate, startDateLabel);
		if (gs.nil(errors)) {
			output.startDate = startDate;
			if (renewalOptions !== '') {
				if (typeof C_OPTION_MAPPING[renewalOptions] !== 'undefined') {
					var years = C_OPTION_MAPPING[renewalOptions].y;
					var months = C_OPTION_MAPPING[renewalOptions].m;
					var days = C_OPTION_MAPPING[renewalOptions].d;
					var endDateObject = global.AssetUtils.getInternalDate(startDate,
						gs.getSession().getUser().getDateFormat());
					endDateObject.addDays(days - 1);
					endDateObject.addMonths(months);
					endDateObject.addYears(years);
					output.endDate = endDateObject.getDate().getDisplayValue();
				}
			} else {
				errors = this._validateEndDate(startDate, startDateLabel, endDate, endDateLabel);
				if (gs.nil(errors)) {
					output.endDate = endDate;
				}
			}
		} else {
			output.errorMessage = errors;
		}
		return JSON.stringify(output);
	},
	cancelContract: function() {
		var sysId = this.getParameter('sysparm_sys_id');
		var gr = new GlideRecord('ast_contract');
		gr.get(sysId);
		new global.ContractManagementUtils().activateRateCards(gr, false);
		gr.state = 'cancelled';
		gr.substate = '';
		gr.update();
	},
	type: 'ContractManagementUtilsAJAX',
});
