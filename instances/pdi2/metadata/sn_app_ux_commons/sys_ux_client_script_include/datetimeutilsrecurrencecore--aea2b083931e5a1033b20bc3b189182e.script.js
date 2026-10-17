function include({ imports }) {
    return {
        mapDateFnsToDayJsFormat: _mapDateFnsToDayJsFormat,
        getCurrentDateInTimezone: _getCurrentDateInTimezone,
        getNearestRoundedTimes: _getNearestRoundedTimes,
        getDateAfterSixMonths: _getDateAfterSixMonths,
        getDayBasedOnDate: _getDayBasedOnDate,
        getDate: _getDate,
        getMonth: _getMonth,
        isFirstTimeBeforeSecondTime: _isFirstTimeBeforeSecondTime,
        isDateOneBeforeDateTwo: _isDateOneBeforeDateTwo,
        isTimeInInvalidFormat: _isTimeInInvalidFormat,
        isDateInInvalidFormat: _isDateInInvalidFormat,
        getWeekLabel: _getWeekLabel,
        setDate: _setDate,
        getDateFromWeekAndDay: _getDateFromWeekAndDay
    };

    /**
     * Maps date-fns format to day.js format.
     * @param {string} dateFnsFormat - The format string used by date-fns.
     * @returns {string} - The corresponding format string for day.js.
     */
    function _mapDateFnsToDayJsFormat(dateFnsFormat) {
        const formatMap = {
            'yyyy': 'YYYY',
            'yy': 'YY',
            'MMMM': 'MMMM',
            'MMM': 'MMM',
            'MM': 'MM',
            'M': 'M',
            'dd': 'DD',
            'd': 'D',
            'EEEE': 'dddd',
            'EEE': 'ddd',
            'HH': 'HH',
            'H': 'H',
            'hh': 'hh',
            'h': 'h',
            'mm': 'mm',
            'm': 'm',
            'ss': 'ss',
            's': 's',
            'a': 'A',
            'aa': 'A',
        };

        return dateFnsFormat.replace(/yyyy|yy|MMMM|MMM|MM|M|dd|d|EEEE|EEE|HH|H|hh|h|mm|m|ss|s|a|aa/g, match => formatMap[match]);
    }

    /**
     * Gets the current date formatted as "DD-MM-YYYY" in the specified timezone.
     *
     * @param {string} timezone - The IANA timezone identifier (e.g., "America/New_York").
     * @param format - The date format
     * @returns {string} The current date in the format "DD-MM-YYYY" for the specified timezone.
     */
    function _getCurrentDateInTimezone(timezone, format) {
        const { NowDateTime } = imports['sn_uxf.core_libraries']();
        const currentDate = new Date();
        const nowInTimezone = NowDateTime(currentDate).tz(timezone);
        const dayJsFormat = _mapDateFnsToDayJsFormat(format);
        return nowInTimezone.format(dayJsFormat);
    }

    /**
     * Gets the date after six months formatted as "DD-MM-YYYY" based on current date.
     *
     * @param {string}  currentDate - date
     * @param {string} format = format to be used
     * @returns {string} The date in the format "DD-MM-YYYY" for the specified timezone.
     */
    function _getDateAfterSixMonths(currentDate, format) {
        const { NowDateTime } = imports['sn_uxf.core_libraries']();
        // Mapping date-fns format tokens to dayjs format tokens for date only
        const dayJsFormat = _mapDateFnsToDayJsFormat(format);
        return NowDateTime.utc(currentDate, dayJsFormat).add(6, 'month').format(dayJsFormat);
    }

    /**
     * Get week based on a give date and format
     *
     * @param {string}  currentDate - date
     * @param {string} format - format
     * @returns {number} The day in number.
     */
    function _getDayBasedOnDate(currentDate, format) {
        const { NowDateTime } = imports['sn_uxf.core_libraries']();
        const dayJsFormat = _mapDateFnsToDayJsFormat(format);
        const day = NowDateTime.utc(currentDate, dayJsFormat).format("ddd");
        const dayMap = Object.freeze({
            "Sun": 0,
            "Mon": 1,
            "Tue": 2,
            "Wed": 3,
            "Thu": 4,
            "Fri": 5,
            "Sat": 6
        })
        return dayMap[day];
    }

    /**
     * Gets date number based on date.
     *
     * @param {string}  currentDate - date
     * @param {string} format - format
     * @returns {string} The date in the format "DD-MM-YYYY" for the specified timezone.
     */
    function _getDate(currentDate, format) {
        const { NowDateTime } = imports['sn_uxf.core_libraries']();
        const dayJsFormat = _mapDateFnsToDayJsFormat(format);
        return NowDateTime.utc(currentDate, dayJsFormat).date();
    }

    /**
     * set Date on currentDate
     *
     * @param {string}  currentDate - complete date
     * @param {string} date - date to set
     * @param {string} format - format
     * @returns {string} The date in the format "DD-MM-YYYY" for the specified timezone.
     */
    function _setDate(currentDate, date, format) {
        const { NowDateTime } = imports['sn_uxf.core_libraries']();
        const dayJsFormat = _mapDateFnsToDayJsFormat(format);
        const currentDateObj = NowDateTime.utc(currentDate, dayJsFormat);
        return currentDateObj.set('date', date).format(dayJsFormat)
    }

     /**
     * Gets month based on date.
     *
     * @param {string}  date - date
     * @returns {number} The month in number format
     */
     function _getMonth(date, format) {
        const { NowDateTime } = imports['sn_uxf.core_libraries']();
        const dayJsFormat = _mapDateFnsToDayJsFormat(format);
        const month = NowDateTime.utc(date, dayJsFormat).format("MMM");
        const monthMap = Object.freeze({
            "Jan": 0,
            "Feb": 1,
            "Mar": 2,
            "Apr": 3,
            "May": 4,
            "Jun": 5,
            "Jul": 6,
            "Aug": 7,
            "Sep": 8,
            "Oct": 9,
            "Nov": 10,
            "Dec": 11,
        })
        return monthMap[month];


    }

    /**
     * Calculates the nearest rounded-off times based on the current time, adjusted for the specified timezone.
     * The start time is rounded to the nearest 30-minute interval, and the end time is 1 hour after the start time.
     *
     * @param {string} timezone - The IANA timezone identifier (e.g., "America/New_York").
     * @param {string} format = Format of time
     * @returns {Object} An object containing:
     * - `startTime` {Object} - The rounded start time as a moment-like object.
     * - `endTime` {Object} - The end time, 1 hour after the start time, as a moment-like object.
     */
    function _getNearestRoundedTimes(timezone, format) {
        const { NowDateTime } = imports['sn_uxf.core_libraries']();
        const currentDate = new Date();
        const nowInTimezone = NowDateTime(currentDate).tz(timezone);
        const minutes = nowInTimezone.minute();
        const additionalMinutes = 30 - (minutes % 30); // Calculate minutes to add
        const startTime = nowInTimezone.add(additionalMinutes, 'minute').startOf('minute');
        const endTime = nowInTimezone.add(additionalMinutes + 60, 'minute').startOf('minute');
        const dayJsFormat = _mapDateFnsToDayJsFormat(format);
        return {
            startTime: startTime.format(dayJsFormat),
            endTime: endTime.format(dayJsFormat)
        };
    }

    /**
     * Checks if the given date is in an invalid format.
     * @param {string} dateString - The date string to validate.
     * @param {string} dateFnsFormat - The format string to validate against.
     * @returns {boolean} - True if the date is in an invalid format, false otherwise.
     */
    function _isDateInInvalidFormat(dateString, dateFnsFormat) {
        if(!dateString)
            return false;
        const { NowDateTime } = imports['sn_uxf.core_libraries']();
        const dayJsFormat = _mapDateFnsToDayJsFormat(dateFnsFormat);
        return !NowDateTime.utc(dateString, dayJsFormat, true).isValid();
    }

    /**
     * Checks if the given time is in an invalid format.
     * @param {string} timeString - The time string to validate.
     * @param {string} format - The format string to validate against.
     * @returns {boolean} - True if the time is in an invalid format, false otherwise.
     */
    function _isTimeInInvalidFormat(timeString, format) {
        if(!timeString)
            return false

        const { NowDateTime } = imports['sn_uxf.core_libraries']();
        const dayJsFormat = _mapDateFnsToDayJsFormat(format);
    
        // Normalize AM/PM to uppercase
        const normalizedTimeString = timeString.replace(/\b(am|pm)\b/i, match => match.toUpperCase());
    
        // Ensure the hour has a leading zero if the format expects 'hh'
        const timeWithLeadingZero = normalizedTimeString.replace(
            /^(\d{1}):/,
            match => `0${match}`
        );
    
        const timeWithDate = `2024-11-10 ${timeWithLeadingZero}`;
        const formatWithDate = `YYYY-MM-DD ${dayJsFormat}`;
        return !NowDateTime.utc(timeWithDate, formatWithDate, true).isValid();;
    }


    /**
     * Determines if the first time is before the second time.
     * @param {string} toTime - The target time.
     * @param {string} fromTime - The reference time.
     * @param {string} format - The time format.
     * @returns {boolean} - True if the first time is before the second time, false otherwise.
     */
    function _isFirstTimeBeforeSecondTime(toTime, fromTime, format) {
        const { NowDateTime } = imports['sn_uxf.core_libraries']();

        if(!toTime || !fromTime)
            return false
        if(_isTimeInInvalidFormat(fromTime, format) || _isTimeInInvalidFormat(toTime, format))
            return false
        const dayJsFormat = _mapDateFnsToDayJsFormat(format);
        const formatWithDate = `YYYY-MM-DD ${dayJsFormat}`;
    
        // Normalize AM/PM to uppercase
        const normalizedToTime = toTime.replace(/\b(am|pm)\b/i, match => match.toUpperCase());
        const normalizedFromTime = fromTime.replace(/\b(am|pm)\b/i, match => match.toUpperCase());
    
        const toTimeWithDate = `2024-11-10 ${normalizedToTime}`;
        const fromTimeWithDate = `2024-11-10 ${normalizedFromTime}`;
        const toTimeDayJsObj = NowDateTime.utc(toTimeWithDate, formatWithDate);
        const fromTimeDAyJs = NowDateTime.utc(fromTimeWithDate, formatWithDate);
        return toTimeDayJsObj.isBefore(fromTimeDAyJs);
    }

    /**
     * Determines if the first date is before the second date.
     * @param {string} date1 - The first date string.
     * @param {string} date2 - The second date string.
     * @param {string} format - The date format.
     * @returns {boolean} - True if date1 is before date2, false otherwise.
     */
    function _isDateOneBeforeDateTwo(date1, date2, format) {
        const { NowDateTime } = imports['sn_uxf.core_libraries']();
        if(!date1 || !date2)
            return false
        if(_isDateInInvalidFormat(date1, format) || _isDateInInvalidFormat(date2, format))
            return false
        const dayJsFormat = _mapDateFnsToDayJsFormat(format);
        const dateOneDayJsObj = NowDateTime.utc(date1, dayJsFormat);
        const dateTwoDayJsObj = NowDateTime.utc(date2, dayJsFormat);
        return dateOneDayJsObj.isBefore(dateTwoDayJsObj);
    }

    // Function to get the week number of the month
  function _getWeekOfMonth(date) {
    const daysSinceStartOfMonth = date.date() - 1; // Get days since start of the month (0-indexed)
    return Math.floor(daysSinceStartOfMonth / 7) + 1;
  }

  // Function to determine if the date is in the first, second, third, fourth, or last week of the month
  /**
     * @param {string} givenDate
     * @param {string} format
     */
  function _getWeekLabel(givenDate, format) {
    const WEEK_LABEL = {
        FIRST: 'first',
        SECOND: 'second',
        THIRD: 'third',
        FOURTH: 'fourth',
        LAST: 'last'
    }
    const {FIRST, SECOND, THIRD, FOURTH, LAST} = WEEK_LABEL;
    const { NowDateTime } = imports["sn_uxf.core_libraries"]();
    const dayJsFormat = _mapDateFnsToDayJsFormat(format);
    const date = NowDateTime.utc(givenDate, dayJsFormat);
    const weekOfMonth = _getWeekOfMonth(date);
    const daysInMonth = date.daysInMonth();
    const weeksInMonth = Math.ceil(daysInMonth / 7);

    if (weekOfMonth === 1) {
      return FIRST;
    } else if (weekOfMonth === 2) {
      return SECOND;
    } else if (weekOfMonth === 3) {
      return THIRD
    } else if (weekOfMonth === 4) {
      return FOURTH;
    } else if (weekOfMonth >= weeksInMonth) {
      return LAST;
    } else {
      return `${weekOfMonth}th week`; // For weeks in between
    }
  }

  function _getDateFromWeekAndDay(givenDate, format, weekLabel, dayOfWeekNum) {
    const weekMap = { first: 1, second: 2, third: 3, fourth: 4, last: -1 };
    const { NowDateTime } = imports["sn_uxf.core_libraries"]();
    const dayJsFormat = _mapDateFnsToDayJsFormat(format);
    const date = NowDateTime.utc(givenDate, dayJsFormat);
    const year = date.year();
    const month = date.month();
    const firstDay = NowDateTime.utc(`${year}-${String(month + 1).padStart(2, "0")}-01`, "YYYY-MM-DD");
    let targetDate = firstDay.day(dayOfWeekNum); // Find the first occurrence

    if (targetDate.month() !== month) {
        targetDate = targetDate.add(7, 'day'); // Adjust if the first occurrence is in the previous month
    }

    if (weekLabel === 'last') {
        let lastOccurrence = targetDate;
        while (lastOccurrence.add(7, 'day').month() === month) {
            lastOccurrence = lastOccurrence.add(7, 'day');
        }
        return lastOccurrence.format(dayJsFormat);
    }
    const weekOffset = weekMap[weekLabel.toLowerCase()];
    return targetDate.add((weekOffset - 1) * 7, 'day').format(dayJsFormat);
  }
}
