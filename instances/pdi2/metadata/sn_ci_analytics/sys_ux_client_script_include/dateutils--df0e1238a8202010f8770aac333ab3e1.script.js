function include({imports}) {
    const getPaddedVal = function(val) {
        return ((parseInt(val) < 10) ? ('0' + val) : val);
    };

    const getDaysDelta = function(fromDate, toDate) {
        const parsedStart = new Date(fromDate);
        const parsedEnd = new Date(toDate);

        let daysDelta;

        if (parsedStart && parsedEnd) {
            const diff = parsedEnd.getTime() - parsedStart.getTime();
            daysDelta = (diff  / 86400000) + 1;  // Milliseconds in a day is 86400000
        }

        return daysDelta ? Math.round(daysDelta) : null;
    };

    const isValidDate = function(date) {
        return date instanceof Date && !isNaN(date);
    };

    /* 
     * Date Picker returns isoStart and isoEnd based on time zones and  
     * we need to remove the possible +-1 error in days.
     */
    const getDateRangeFromISOString = function(isoStartDate, isoEndDate) {
        if (!isoStartDate || !isoEndDate) {
            return;
        }
        const startDateInstance = new Date(isoStartDate);
        const endDateInstance = new Date(isoEndDate);
        return {
            startDate: startDateInstance.getFullYear() + "-" + (getPaddedVal(startDateInstance.getMonth() + 1)) + "-" + (getPaddedVal(startDateInstance.getDate())),
            endDate: endDateInstance.getFullYear() + "-" + (getPaddedVal(endDateInstance.getMonth() + 1)) + "-" + (getPaddedVal(endDateInstance.getDate()))
        }
    }

    const calculateInitialDateRange = function(startDate, endDate) {
        let isoFormattedStartDate, isoFormattedEndDate;
        const startDateObject = new Date(startDate);
        const endDateObject = new Date(endDate);
        let dateRange = {};

        /* 
         * If both date objects are valid, then use them for request body to remote 
         * tables and data brokers else calculate default 7 day date range
         */
        if (isValidDate(startDateObject) && isValidDate(endDateObject)) {
            isoFormattedStartDate = startDateObject.toISOString().slice(0, 10);
            isoFormattedEndDate = endDateObject.toISOString().slice(0, 10);
            dateRange.datePickerStartDate = startDateObject;
            dateRange.datePickerEndDate = endDateObject;
        } else {
            const currentDate = new Date();
            const previousDate = new Date(currentDate - (7 * 24 * 60 * 60 * 1000));
            isoFormattedStartDate = previousDate.toISOString().slice(0, 10);
            isoFormattedEndDate = currentDate.toISOString().slice(0, 10);
            dateRange.datePickerStartDate = previousDate;
            dateRange.datePickerEndDate = currentDate;
        }

        dateRange.isoFormattedStartDate = isoFormattedStartDate;
        dateRange.isoFormattedEndDate = isoFormattedEndDate;
        return dateRange;
    }

    return {
        getDaysDelta: getDaysDelta,
        isValidDate: isValidDate,
        getDateRangeFromISOString: getDateRangeFromISOString,
        calculateInitialDateRange: calculateInitialDateRange
    };
}
