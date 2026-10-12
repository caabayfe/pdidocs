function monthlyClicked(button) {
	generateClickEvent("Schedule_view_monthly");
	jQuery("#today").removeClass("active");
}

function weeklyClicked() {
	generateClickEvent("Schedule_view_weekly");
	jQuery("#today").removeClass("active");
}

function dailyClicked() {
	generateClickEvent("Schedule_view_daily");
	jQuery("#today").removeClass("active");
}


function gotoLastMonth() {
    showOverlay();
    var iframeDocumentObject = document.getElementById("schedule_calender_frame").contentWindow.document;
    iframeDocumentObject.getElementById("ScheduledailyPrevious").childNodes[0].childNodes[0].click();
    document.getElementById("calenderMonthYearInfo").innerHTML = iframeDocumentObject.getElementById("Schedule_title").innerHTML;
}

function gotoNextMonth() {
    showOverlay();
    var iframeDocumentObject = document.getElementById("schedule_calender_frame").contentWindow.document;
    iframeDocumentObject.getElementById("Schedule_next").childNodes[2].childNodes[0].click();
    document.getElementById("calenderMonthYearInfo").innerHTML = iframeDocumentObject.getElementById("Schedule_title").innerHTML;
}

function generateClickEvent(viewType) {
    showOverlay();
    var iframeDocumentObject = document.getElementById("schedule_calender_frame").contentWindow.document;
    iframeDocumentObject.getElementById(viewType).parentElement.click();
    document.getElementById("calenderMonthYearInfo").innerHTML = iframeDocumentObject.getElementById("Schedule_title").innerHTML;
}

function gotoCurrentDay() {
    showOverlay();
    var iframeDocumentObject = document.getElementById("schedule_calender_frame").contentWindow.document;
    try {
        iframeDocumentObject.getElementById("elementAnchor").click();
    } catch (err) {}
    iframeDocumentObject.getElementsByClassName("calText calTodayText pointerhand")[0].click();
    document.getElementById("calenderMonthYearInfo").innerHTML = iframeDocumentObject.getElementById("Schedule_title").innerHTML;
    jQuery("#day").addClass("active");
    jQuery("#month").removeClass("active");
    jQuery("#week").removeClass("active");

}

function showOverlay() {
    fireEvent("sn-appclient.show-overlay");
}

function fireEvent(eventName) {
    window.parent.CustomEvent.fire(eventName);
}
jQuery(document.getElementById("schedule_calender_frame").contentWindow.document).ready(function() {
    CustomEventManager.on('sn_appclient.hide-calender-loading', function(data) {
        fireEvent("sn-appclient.hide-overlay");
    });
});
