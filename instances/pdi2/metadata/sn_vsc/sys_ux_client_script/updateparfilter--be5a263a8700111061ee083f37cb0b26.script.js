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
    var firstScanDateTime = "";
    var secondScanDateTime = "";
    const dateUtil = imports['sn_vsc.SCDateUtils']();

    if (!api.state.firstScanDate || api.state.firstScanDate == "" || !api.state.firstScanTime) {
        firstScanDateTime = (api.state.firstAvailableDate + " " + api.state.firstAvailableTime).toString();
    } else {
        api.setState("scanDate1", api.state.firstScanDate);
        api.setState("scanTime1", api.state.firstScanTime);
        var dateDefaultFormat = dateUtil.userToDefaultFormat(api.state.firstScanDate, api.context.session.user.dateFormat);
        api.setState("firstClickedDisplayDate", dateDefaultFormat);
        firstScanDateTime = (api.state.firstScanDate + " " + api.state.firstScanTime).toString();
    }

    if (!api.state.secondScanDate || api.state.secondScanDate == "" || !api.state.secondScanTime) {
        secondScanDateTime = (api.state.secondAvailableDate + " " + api.state.secondAvailableTime).toString();
    } else {
        api.setState("scanDate2", api.state.secondScanDate);
        api.setState("scanTime2", api.state.secondScanTime);
        var dateDefaultFormat = dateUtil.userToDefaultFormat(api.state.secondScanDate, api.context.session.user.dateFormat);
        api.setState("secondClickedDisplayDate", dateDefaultFormat);
        secondScanDateTime = (api.state.secondScanDate + " " + api.state.secondScanTime).toString();
    }

    if (api.state.firstSelectedId && api.state.firstSelectedId != null && api.state.firstSelectedId != "") {
        var firstDatesData = api.state.firstDropdownListData;
        firstScanDateTime = (firstDatesData[0].label + " " + firstDatesData[0].time).toString();
        api.setState("scanDate1", firstDatesData[0].label);
        api.setState("scanTime1", firstDatesData[0].time);
        var dateDefaultFormat = dateUtil.userToDefaultFormat(firstDatesData[0].label, api.context.session.user.dateFormat);
        api.setState("firstClickedDisplayDate", dateDefaultFormat);
    }

    if (api.state.secondSelectedId && api.state.secondSelectedId != null && api.state.secondSelectedId != "") {
        var secondDatesData = api.state.secondDropdownListData;
        secondScanDateTime = (secondDatesData[0].label + " " + secondDatesData[0].time).toString();
        api.setState("scanDate2", secondDatesData[0].label);
        api.setState("scanTime2", secondDatesData[0].time);
        var dateDefaultFormat = dateUtil.userToDefaultFormat(secondDatesData[0].label, api.context.session.user.dateFormat);
        api.setState("secondClickedDisplayDate", dateDefaultFormat);
    }

    if (firstScanDateTime && firstScanDateTime != "" && secondScanDateTime && secondScanDateTime != "") {
        api.data.vsc_scan_comparison_1.refresh({
            "date1": firstScanDateTime,
            "date2": secondScanDateTime
        });
        api.setState("firstScanDateTime", firstScanDateTime);
        api.setState("secondScanDateTime", secondScanDateTime);
    }

    api.setState("firstClickedId", "");
    api.setState("secondClickedId", "");
    api.setState("dataVizQuery", "");
}
