(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {


    //allow only timeago functions
    //sanitize DateFunction 
    function sanitizeInput(dateFunc) {

        var sanitizedDateFunc = '';

        var TIME_AGO_FUNCTIONS = new Array('gs.beginningOfCurrentHour()', 'gs.beginningOfCurrentMinute()', 'gs.beginningOfLast120Days()', 'gs.beginningOfLast12Months()', 'gs.beginningOfLast15Minutes()', 'gs.beginningOfLast2Hours()', 'gs.beginningOfLast2Quarters()', 'gs.beginningOfLast2Years()', 'gs.beginningOfLast30Days()', 'gs.beginningOfLast30Minutes()', 'gs.beginningOfLast3Months()', 'gs.beginningOfLast45Minutes()', 'gs.beginningOfLast60Days()', 'gs.beginningOfLast6Months()', 'gs.beginningOfLast7Days()', 'gs.beginningOfLast90Days()', 'gs.beginningOfLast9Months()', 'gs.beginningOfLastHour()', 'gs.beginningOfLastMinute()', 'gs.beginningOfLastMonth()', 'gs.beginningOfLastQuarter()', 'gs.beginningOfLastWeek()', 'gs.beginningOfLastYear()', 'gs.beginningOfNext2Quarters()', 'gs.beginningOfNextMonth()', 'gs.beginningOfNextQuarter()', 'gs.beginningOfNextWeek()', 'gs.beginningOfNextYear()', 'gs.beginningOfOneYearAgo()', 'gs.beginningOfThisMonth()', 'gs.beginningOfThisQuarter()', 'gs.beginningOfThisWeek()', 'gs.beginningOfThisYear()', 'gs.beginningOfToday()', 'gs.beginningOfTomorrow()', 'gs.beginningOfYesterday()', 'gs.endOfCurrentHour()', 'gs.endOfCurrentMinute()', 'gs.endOfLast120Days()', 'gs.endOfLast12Months()', 'gs.endOfLast15Minutes()', 'gs.endOfLast2Hours()', 'gs.endOfLast2Quarters()', 'gs.endOfLast2Years()', 'gs.endOfLast30Days()', 'gs.endOfLast30Minutes()', 'gs.endOfLast3Months()', 'gs.endOfLast45Minutes()', 'gs.endOfLast60Days()', 'gs.endOfLast6Months()', 'gs.endOfLast7Days()', 'gs.endOfLast90Days()', 'gs.endOfLast9Months()', 'gs.endOfLastHour()', 'gs.endOfLastMinute()', 'gs.endOfLastMonth()', 'gs.endOfLastQuarter()', 'gs.endOfLastWeek()', 'gs.endOfLastYear()', 'gs.endOfNext2Quarters()', 'gs.endOfNextMonth()', 'gs.endOfNextQuarter()', 'gs.endOfNextWeek()', 'gs.endOfNextYear()', 'gs.endOfOneYearAgo()', 'gs.endOfThisMonth()', 'gs.endOfThisQuarter()', 'gs.endOfThisWeek()', 'gs.endOfThisYear()', 'gs.endOfToday()', 'gs.endOfTomorrow()', 'gs.endOfYesterday()', 'gs.beginningOfNextSchedulePeriod()', 'gs.beginningOfLastSchedulePeriod()', 'gs.beginningOfSchedulePeriodsAgo()', 'gs.beginningOfThisSchedulePeriod()', 'gs.endOfLastSchedulePeriod()', 'gs.endOfNextSchedulePeriod()', 'gs.endOfSchedulePeriodsAgo()', 'gs.endOfThisSchedulePeriod()');

        //take off javascript:
        var dateFuncToCheck = dateFunc
            .replace('javascript:', '');

        if (new ArrayUtil().contains(TIME_AGO_FUNCTIONS, dateFuncToCheck)) {
            return dateFuncToCheck;
        }

    }

    //get the params from the function 
    //ex.javascript:sn_bc.GlideBusinessCalendarUtil.getCalendarEnd('Fiscal Month', '-1')
    //get Fiscal Month and -1
    function getBusinessCalParams(dateFunc) {
        var params = [];
        var businessCalParams = {
            calendarName: '',
            period: ''
        };
        if (dateFunc) {
            //get the params in quotes
            params = dateFunc
                .match(/'(.*?)'/g);
        }
        //accept only 2 params 
        if (params && params.length == 2) {
            businessCalParams.calendarName = params[0].replaceAll("'", "");
            businessCalParams.period = params[1].replaceAll("'", "");
        }
        return businessCalParams;
    }

    //business calendar dates can come in as getCalendarStart or getCalendarEnd 
    //and can come in as from or end date 
    function getBusinessCalDate(dateStr) {
        var absoluteDate = '';
        var params = getBusinessCalParams(dateStr);
        var calendarName = params.calendarName;
        var period = params.period;
        if (calendarName && period) {
            if (dateStr.indexOf('getCalendarStart') > 0) {
                absoluteDate = sn_bc.GlideBusinessCalendarUtil.getCalendarStart(calendarName, period);
            } else if (dateStr.indexOf('getCalendarEnd') > 0) {
                absoluteDate = sn_bc.GlideBusinessCalendarUtil.getCalendarEnd(calendarName, period);
            }
        }
        return absoluteDate;
    }

    //Get absolute date time for relative TimeAgo strings 
    //including Fiscal and Business Calendars
    //ex. relative datetime > javascript:gs.beginningOfLast3Months()

    //from_date - TimeAgo relative date/time String for From Date
    //to_date - TimeAgo relative date/time String for To Date
    var fromDate = request.queryParams.from_date + '';
    var toDate = request.queryParams.to_date + '';

    var fromDateAbsolute = '';
    var toDateAbsolute = '';

    //handle business calendars
    if (fromDate.indexOf('GlideBusinessCalendarUtil') > 0 || toDate.indexOf('GlideBusinessCalendarUtil') > 0) {
        fromDateAbsolute = getBusinessCalDate(fromDate);
        toDateAbsolute = getBusinessCalDate(toDate);
    } else {
        //non business calendars
        fromDate = sanitizeInput(fromDate);
        toDate = sanitizeInput(toDate);
        fromDateAbsolute = fromDate ? GlideEvaluator.evaluateString(fromDate) : '';
        toDateAbsolute = toDate ? GlideEvaluator.evaluateString(toDate) : '';
    }

    return {
        fromDate: fromDateAbsolute,
        toDate: toDateAbsolute
    };

})(request, response);
