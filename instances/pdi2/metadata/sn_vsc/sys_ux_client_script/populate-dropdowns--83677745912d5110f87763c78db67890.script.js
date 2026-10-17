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
    try {
        const dateUtil = imports['sn_vsc.SCDateUtils']();
        const userFormat = api?.context?.session?.user?.dateFormat || 'yyyy-MM-dd';

        /* If the defaultFirstDate and defaultSecondDate are already being pulled for default / existing comparison */
        if (api.state.defaultFirstDate && api.state.defaultSecondDate) {
            /* If the dates are equal to each other, throw in an empty screen */
            if (api.state.defaultFirstDate == api.state.defaultSecondDate) {
                return;
            }
        }

        var newDates = api?.data?.get_all_score_dates_1?.output;

        if (!newDates || newDates.length < 2) {
            return;
        }
        
        let oldestComparisonDate, secondNewestComparisonDate, newestComparisonDate;
        let enabledDatesForDatePicker = {};
        
        newDates.map((date, index) => {
            date = date.split(" ")[0];
            if (!enabledDatesForDatePicker.hasOwnProperty(date)) {
                // Maintain an array of enabled dates for date picker
                enabledDatesForDatePicker[date] = date;
                if (!newestComparisonDate) {
                    newestComparisonDate = date;
                } else if (!secondNewestComparisonDate) {
                    secondNewestComparisonDate = date;
                }
                oldestComparisonDate = date;
            }
        });

        // Prepare an array of disabled dates for date picker
        let disabledDatesForPicker = [];
        let start = oldestComparisonDate;
        let end = newestComparisonDate;
        var dt = dateUtil.getDateObj(start, userFormat);//new Date(start + 'T00:00:00Z');
        var endDT = dateUtil.getDateObj(end, userFormat);
        while (dt < endDT) {
            let dtToPush = dateUtil.formatDate(dt, userFormat);
            // Only push to disabledDatesForPicker array, if those are not the available ones
            if (!enabledDatesForDatePicker.hasOwnProperty(dtToPush)) {
                disabledDatesForPicker.push(dtToPush);
            }
            dt.setDate(dt.getDate() + 1);
        }
        api.setState("disabledDatesForDatePicker", disabledDatesForPicker);

        let defaultFirstDate, defaultSecondDate;
        /* If the defaultFirstDate is already being pulled for default / existing comparison */
        if (api.state.defaultFirstDate) {
            defaultFirstDate = api.state.defaultFirstDate;
        } else {
            defaultFirstDate = secondNewestComparisonDate;
        }

        /* If the defaultSecondDate is already being pulled for default / existing comparison */
        if (api.state.defaultSecondDate) {
            defaultSecondDate = api.state.defaultSecondDate;
        } else {
            defaultSecondDate = newestComparisonDate;
        }

        api.setState('oldestComparisonDate', oldestComparisonDate);
        api.setState('newestComparisonDate', newestComparisonDate);

        /* Setting default selection of the dates */
        api.setState('defaultFirstDate', defaultFirstDate);
        api.setState('defaultSecondDate', defaultSecondDate);

        api.setState('date1Selected', defaultFirstDate);
        if (!api.state.date1Applied) {
            api.setState('date1Applied', dateUtil.userToDefaultFormat(defaultFirstDate, userFormat));
            api.setState('date1AppliedDisplay', defaultFirstDate);
        }
        api.setState('date2Selected', defaultSecondDate);
        if (!api.state.date2Applied) {
            api.setState('date2Applied', dateUtil.userToDefaultFormat(defaultSecondDate, userFormat));
            api.setState('date2AppliedDisplay', defaultSecondDate);
        }

        /** Updating parFilters on page load defaults */
        var parFiltersArray = [];
        const startDate = defaultFirstDate;
        const endDate = defaultSecondDate;
        const dateQuery = "usr_sys_created_onBETWEENjavascript:gs.dateGenerate('" + startDate + "','00:00:00')@javascript:gs.dateGenerate('" + endDate + "','23:59:59')";
        const metricQuery = dateQuery;
        parFiltersArray.push({
            order: 10,
            type: "query",
            apply_to: ["sn_vsc_changed_hardening_setting"],
            encoded_query: metricQuery
        });
        api.setState("parFilters", parFiltersArray);
    } catch (e) {
        console.log("[ populate_dropdwowns ] Exception in populating start and end dates dropdowns::", e);
    }
}
