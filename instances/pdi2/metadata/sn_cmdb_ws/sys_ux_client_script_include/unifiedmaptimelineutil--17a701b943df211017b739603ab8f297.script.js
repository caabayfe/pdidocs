function include({ imports }) {

	const DEFAULT_START_NUM_DAYS = 21;
	const DEFAULT_END_NUM_DAYS = 7;
	const DEFAULT_BOUNDS_NUM_BEGIN_MONTHS = 6;
	const DEFAULT_BOUNDS_NUM_END_MONTHS = 6;

    // return todays date - DEFAULT_START_NUM_DAYS
    const _getDefaultStartDate = () => {
        let start = new Date();
        start.setDate(start.getDate() - DEFAULT_START_NUM_DAYS);
        return _formatDateForTimeline(start);
    }

    // return todays date + DEFAULT_END_NUM_DAYS
    const _getDefaultEndDate = () => {
        let end = new Date();
        end.setDate(end.getDate() + DEFAULT_END_NUM_DAYS);
        return _formatDateForTimeline(end);
    }

    // default to DEFAULT_BOUNDS_NUM_BEGIN_MONTHS in the past 
    const _getDefaultTimelineStartBounds = () => {
        let start = new Date();
        start.setMonth(start.getMonth() - DEFAULT_BOUNDS_NUM_BEGIN_MONTHS);
        return _formatDateForTimeline(start);
    }

    // default to DEFAULT_BOUNDS_NUM_END_MONTHS months in the future
    const _getDefaultTimelineEndBounds = () => {
        let end = new Date();
        end.setMonth(end.getMonth() + DEFAULT_BOUNDS_NUM_END_MONTHS);
        return _formatDateForTimeline(end);
    }

    // custom date selected. Subtracts # of months from today
    const _getCustomDateMonthsInPast = (months) => {
        if (!_isValidDateNumericInput(months))
            return "";
        let end = new Date();
        end.setMonth(end.getMonth() - months);
        return _formatDateForTimeline(end);
    }

    // custom date selected. Adds # of months from today
    const _getCustomDateMonthsInFuture = (months) => {
        if (!_isValidDateNumericInput(months))
            return "";
        let end = new Date();
        end.setMonth(end.getMonth() + months);
        return _formatDateForTimeline(end);
    }

    // custom date selected. Subtracts # of months from today
    const _getCustomDateDaysInPast = (days) => {
        if (!_isValidDateNumericInput(days))
            return "";
        let end = new Date();
        end.setMonth(end.getDate() - days);
        return _formatDateForTimeline(end);
    }

    // custom date selected. Adds # of months from today
    const _getCustomDateDaysInFuture = (days) => {
        if (!_isValidDateNumericInput(days))
            return "";
        let end = new Date();
        end.setMonth(end.getDate() + days);
        return _formatDateForTimeline(end);
    }

    const _getNowTimestamp = () => {
        return Date.now();
    }

    // timeline does not support timezone information
    const _formatDateForTimeline = (date) => {
        return date ? date.toISOString().replace(/T/, ' ').replace(/\..+/, '') : "";
    }

    // only allow positive integers
    const _isValidDateNumericInput = (num) => {
        return typeof num === "number" && Math.floor(Math.abs(num)) === num;
    }

    const _snakeToCamelCase = (string) => {
        if (!string)
            return;
        return string.toLowerCase().replace(/[-_][a-z]/g, (group) => group.slice(-1).toUpperCase());
    }

    const _getHexColorFromHilightString = (highlightStringColor) => {
        switch (highlightStringColor) {
            case "blue":
                return "#67d3e6";
            case "brown":
                return "#d3a675";
            case "critical":
                return "#e4233a";
            case "gray":
                return "#a3abac";
            case "green":
                return "#51b962";
            case "green-yellow":
                return "#c8da6e";
            case "high":
                return "#fd9800";
            case "info":
                return "#0079cc";
            case "low":
                return "#757581";
            case "magenta":
                return "#e869bf";
            case "moderate":
                return "#7c5cf0";
            case "orange":
                return "#ff8c72";
            case "pink":
                return "#e080a0";
            case "positive":
                return "#33830b";
            case "purple":
                return "#bd7aea";
            case "teal":
                return "#51c2c2";
            case "warning":
                return "#f0e000";
            case "yellow":
                return "#ffc551";
            default:
                return "#a3abac"  // default gray
        }
    }

    return {
        getDefaultTimelineStartBounds: _getDefaultTimelineStartBounds,
        getDefaultTimelineEndBounds: _getDefaultTimelineEndBounds,
        getDefaultStartDate: _getDefaultStartDate,
        getDefaultEndDate: _getDefaultEndDate,
        getCustomDateMonthsInPast: _getCustomDateMonthsInPast,
        getCustomDateMonthsInFuture: _getCustomDateMonthsInFuture,
        getCustomDateDaysInPast: _getCustomDateDaysInPast,
        getCustomDateDaysInFuture: _getCustomDateDaysInFuture,
        getNowTimestamp: _getNowTimestamp,
        getHexColorFromHilightString: _getHexColorFromHilightString,
        snakeToCamelCase: _snakeToCamelCase
    }
}
