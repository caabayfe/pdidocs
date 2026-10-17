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
    var enabledDates = {};
    var disabledDates = [];
    let oldestComparisonDate, newestComparisonDate;
    const dateUtil = imports['sn_vsc.SCDateUtils']();
    const userFormat = api?.context?.session?.user?.dateFormat || 'yyyy-MM-dd';

    var datesArray = api.data.get_scan_suite_results_execution_dates_1.output || [];
    if (datesArray && datesArray.length) {
        api.setState("firstDropdownListData", datesArray.slice(1));
        api.setState("secondDropdownListData", datesArray);

        datesArray.map((record, index) => {
            if (record.id == "123") {
                oldestComparisonDate = datesArray[datesArray.length - 2].displayLabel;
            } else {
                if (!enabledDates.hasOwnProperty(record.displayLabel)) {
                    // Maintain an array of enabled dates for date picker
                    enabledDates[record.displayLabel] = record.displayLabel;
                    if (!newestComparisonDate) {
                        newestComparisonDate = record.displayLabel;
                    }
                    oldestComparisonDate = record.displayLabel;
                }
            }
        });

        let start = oldestComparisonDate;
        let end = newestComparisonDate;
        var dt = dateUtil.getDateObj(start, userFormat);
        var endDT = dateUtil.getDateObj(end, userFormat);

        while (dt < endDT) {
            let dtToPush = dateUtil.formatDate(dt, userFormat);
            if (!enabledDates.hasOwnProperty(dtToPush)) {
                disabledDates.push(dtToPush);
            }
            dt.setDate(dt.getDate() + 1);
        }

        api.setState("disabledDatesForDatePicker", disabledDates);
        api.setState('oldestComparisonDate', oldestComparisonDate);
        api.setState('newestComparisonDate', newestComparisonDate);
    }
}
