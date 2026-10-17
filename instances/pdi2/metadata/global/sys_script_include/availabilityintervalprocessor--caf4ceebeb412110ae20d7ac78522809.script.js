var AvailabilityIntervalProcessor = Class.create();
AvailabilityIntervalProcessor.prototype = {
	initialize: function() {
		this.CONSTANTS = new global.AvailabilityConstants();
		this.adjustedBegin = null;
		this.adjustedEnd = null;
	},

	/**
	 * Calculate the availability intervals that need to be calculated
	 * needed to generate every type of availability record
	 * - calculations done in reference to system time
	 * @param {GlideDateTime} begin
	 * @param {GlideDateTime} end
	 * @param {Object} - object containing the adjusted begin and end dates in UNIX timestamp
	 */
	determineInterval: function(begin, end) {
		var returnObj = {};

		if (!begin || !begin.isValid() || !end || !end.isValid())
			return returnObj;
		else if (this._onOrAfter(end, begin))
			return returnObj;

		this.adjustedBegin = begin;
		this.adjustedEnd = end;

		this._adjustForAnnually(begin, end);
		this._adjustForMonthly(begin, end);
		this._adjustForWeekly(begin, end);

		this._adjustForLastMonths(end, this.CONSTANTS.DURATIONS.LAST_12_MONTHS);
		this._adjustForLastDays(end, this.CONSTANTS.DURATIONS.LAST_30_DAYS);
		this._adjustForLastDays(end, this.CONSTANTS.DURATIONS.LAST_7_DAYS);

		returnObj = {
			adjustedBegin: this.adjustedBegin.getNumericValue(),
			adjustedEnd: this.adjustedEnd.getNumericValue()
		};

		return returnObj;
	},

	/**
	 * Change the adjusted begin and end instance variables (if applicable)
	 * - goal is to increase date segment to capture more outages
	 * @param {GlideDateTime} begin
	 * @param {GlideDateTime} end
	 */
	_adjustInterval: function(begin, end) {
		this.adjustedBegin = this._earlierDate(this.adjustedBegin, begin);
		this.adjustedEnd = this._laterDate(this.adjustedEnd, end);
	},

	/**
	 * Return the earlier date between date1 and date2
	 * - using UNIX timestamp
	 * @param {GlideDateTime} date1
	 * @param {GlideDateTime} date2
	 * @returns {GlideDateTime}
	 */
	_earlierDate: function(date1, date2) {
		if (!date1 || !date1.isValid() || !date2 || !date2.isValid())
			return null;

		var numericDate1 = date1.getNumericValue();
		var numericDate2 = date2.getNumericValue();

		return (numericDate1 < numericDate2 ? date1 : date2);
	},

	/**
	 * Return the later date between date1 and date2
	 * - using UNIX timestamp
	 * @param {GlideDateTime} date1
	 * @param {GlideDateTime} date2
	 * @returns {GlideDateTime}
	 */
	_laterDate: function(date1, date2) {
		if (!date1 || !date1.isValid() || !date2 || !date2.isValid())
			return null;

		var numericDate1 = date1.getNumericValue();
		var numericDate2 = date2.getNumericValue();

		return (numericDate1 > numericDate2 ? date1 : date2);
	},

	/**
	 * Return if date2 is the same date or a later date compared to date1
	 * - using UNIX timestamp
	 * @param {GlideDateTime} date1
	 * @param {GlideDateTime} date2
	 * @returns {boolean}
	 */
	_onOrAfter: function(date1, date2) {
		if (!date1 || !date1.isValid() || !date2 || !date2.isValid())
			return null;

		var numericDate1 = date1.getNumericValue();
		var numericDate2 = date2.getNumericValue();

		return (numericDate2 >= numericDate1);
	},

	/**
	 * Adjust the begin and end dates to retrieve all the outages
	 * occuring within the years of the begin and end dates
	 * - calculations done in reference to system time
	 * @example
	 * // begin will be adjusted to 2020-01-01 00:00:00 local time to capture all outages starting beginning of 2020
	 * // end will be adjusted to 2022-01-01 00:00:00 local time to capture all outages up to end of 2021
	 * _adjustForAnnually(<2020-07-11 12:00:00>, <2021-06-26 12:00:00>)
	 * @param {GlideDateTime} begin
	 * @param {GlideDateTime} end
	 */
	_adjustForAnnually: function(begin, end) {
		if (!begin || !begin.isValid() || !end || !end.isValid())
			return;

		var beginArg = begin;
		var endArg = end;

		// get first day of year based on begin date
		beginArg = new GlideDateTime(gs.beginningOfYear(begin));

		// get last day of year based on end date, only if the end date is before the current year
		var currentYearStart = new GlideDateTime(gs.beginningOfThisYear());
		if (!this._onOrAfter(currentYearStart, end)) {
			endArg = new GlideDateTime(gs.endOfYear(end));
			endArg.addSeconds(1); // add additional second to include midnight second of end date in calculation
		}

		this._adjustInterval(beginArg, endArg);
	},

	/**
	 * Adjust the begin and end dates to retrieve all the outages
	 * occuring within the months of the begin and end dates
	 * - calculations done in reference to system time
	 * @example
	 * // begin will be adjusted to 2020-07-01 local time 00:00:00 to capture all outages starting from beginning of July
	 * // end will be adjusted to 2021-07-01 00:00:00 local time to capture all outages up to end of June
	 * _adjustForMonthly(<2020-07-11 12:00:00>, <2021-06-26 12:00:00>)
	 * @param {GlideDateTime} begin
	 * @param {GlideDateTime} end
	 */
	_adjustForMonthly: function(begin, end) {
		if (!begin || !begin.isValid() || !end || !end.isValid())
			return;

		var beginArg = begin;
		var endArg = end;

		// get start of the month based on begin date
		beginArg = new GlideDateTime(gs.beginningOfMonth(begin));

		// get end of month based on end date, only if the end date is before the current month
		var currentMonthStart = new GlideDateTime(gs.beginningOfThisMonth());
		if (!this._onOrAfter(currentMonthStart, end)) {
			endArg = new GlideDateTime(gs.endOfMonth(end));
			endArg.addSeconds(1); // add additional second to include midnight second of end date in calculation
		}

		this._adjustInterval(beginArg, endArg);
	},

	/**
	 * Adjust the begin and end dates to retrieve all the outages
	 * occuring within the week of the begin and end dates
	 * - calculations done in reference to system time
	 * - week starts on Monday
	 * - week ends on Sunday
	 * @example
	 * // begin will be adjusted to 2020-07-06 00:00:00 local time to capture all outages from Monday at beginning of week
	 * // end will be adjusted to 2021-06-29 00:00:00 local time to capture all outages up to Sunday at end of week
	 * _adjustForWeekly(<2020-07-11 12:00:00>, <2021-06-26 12:00:00>)
	 * @param {GlideDateTime} begin
	 * @param {GlideDateTime} end
	 */
	_adjustForWeekly: function(begin, end) {
		if (!begin || !begin.isValid() || !end || !end.isValid())
			return;

		var beginArg = begin;
		var endArg = end;

		// get beginning of week from begin date
		beginArg = new GlideDateTime(gs.beginningOfWeek(begin));

		// get end of week from end date, only if the end date is before the current week
		var currentWeekStart = new GlideDateTime(gs.beginningOfThisWeek());
		if (!this._onOrAfter(currentWeekStart, end)) {
			endArg = new GlideDateTime(gs.endOfWeek(end));
			endArg.addSeconds(1); // add additional second to include midnight second of end date in calculation
		}

		this._adjustInterval(beginArg, endArg);
	},

	/**
	 * Adjust the begin and end dates to retrieve all the outages
	 * occuring within n days prior to current date
	 * - calculations done in reference to system time
	 * - n days prior calculated off current date
	 * - outages from current date are included (up to the time specified by the end argument)
	 * - only adjusts if end date is within n days prior to current date
	 * @example
	 * // adjustment will only occur if 2020-07-11 12:00:00 is within the last 7 days from the current date
	 * _adjustForLastDays(<2020-07-11 12:00:00>, 7)
	 * @param {GlideDateTime} begin
	 * @param {GlideDateTime} end
	 */
	_adjustForLastDays: function(end, numDays) {
		if (!end || !end.isValid() || !numDays)
			return;

		var beginningOfTomorrow = new GlideDateTime(gs.beginningOfTomorrow());

		var daysAgo = new GlideDateTime(beginningOfTomorrow);
		daysAgo.addDaysLocalTime(-numDays);

		if (this._onOrAfter(daysAgo, end)) // ignore if end date before n days prior
			this._adjustInterval(daysAgo, beginningOfTomorrow);
	},

	/**
	 * Adjust the begin and end dates to retrieve all the outages
	 * occuring within n months prior to current date
	 * - calculations done in reference to system time
	 * - n months prior calculated off current date
	 * - outages from current date are included (up to the time specified by the end argument)
	 * - only adjusts if end date is within n months prior to current date
	 * @example
	 * // adjustment will only occur if 2020-07-11 12:00:00 is within the last 12 months from the current date
	 * _adjustForLastMonths(<2020-07-11 12:00:00>, 12)
	 * @param {GlideDateTime} begin
	 * @param {GlideDateTime} end
	 */
	_adjustForLastMonths: function(end, numMonths) {
		if (!end || !end.isValid() || !numMonths)
			return;

		var beginningOfTomorrow = new GlideDateTime(gs.beginningOfTomorrow());

		var monthsAgo = new GlideDateTime(beginningOfTomorrow);
		monthsAgo.addMonthsLocalTime(-numMonths);

		if (this._onOrAfter(monthsAgo, end)) // ignore if end date before n months prior
			this._adjustInterval(monthsAgo, beginningOfTomorrow);
	},

	type: 'AvailabilityIntervalProcessor'
};
