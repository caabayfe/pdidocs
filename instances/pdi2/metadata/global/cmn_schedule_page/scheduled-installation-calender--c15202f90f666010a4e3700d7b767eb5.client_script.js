function seeCalendarInit() {
    schedulePage.setDisplayMode('monthly');
    schedulePage.addParam('read_only', true);
    schedulePage.getCalendar().setReadOnly(true);
    schedulePage.registerOnDblClickHandler(onDoubleClick);
    schedulePage.run();
}
var todayStyle = {
    "background-color": "#1f8476",
    "opacity": "0.1"
};
jQuery(document).ready(function() {
    var day = schedulePage.calendar.currentDate;
    CustomEventManager.on('request_complete', function(data) {
        var todayId = "add_schedule_Schedule_" + day.getYear() + "-" + (day.getMonth() + 1) + "-" + day.getDay();
        var todayElement = document.getElementById(todayId);
        if(!todayElement)
            todayElement = document.getElementById(todayId + "_undefined");
        if(todayElement)
            Object.assign(todayElement.style, todayStyle);
        if ("daily" == schedulePage.getCalendar().currentView.calendar.displayMode) {
            var timer = setTimeout(function() {
                if (document.getElementsByClassName("drag_section_part").length > 0) {
                    var len = document.getElementsByClassName("drag_section_part").length;
                    for (var i = 0; i != len; i++) {
                        (document.getElementsByClassName("drag_section_part")[i]).style.width = "94%";
			  (document.getElementsByClassName("drag_section_part")[i]).style.left = "54px";
                        (document.getElementsByClassName("drag_section_part")[i]).getElementsByClassName("drag_section_picker")[0].style.width = "100%";
                        (document.getElementsByClassName("drag_section_part")[i]).getElementsByClassName("drag_section_header")[0].style.width = "80%";
                        (document.getElementsByClassName("drag_section_part")[i]).removeAttribute("aria-label");
                    }
                }
                fireEvent('sn_appclient.hide-calender-loading');
            }, 500); 
        } else if("weekly" == schedulePage.getCalendar().currentView.calendar.displayMode) {
            var postions = [55, 189, 323, 458, 593, 727, 863 ];
            var timer = setTimeout(function() {
                if (document.getElementsByClassName("drag_section_part").length > 0) {
                    var len = document.getElementsByClassName("drag_section_part").length;
                    for (var i = 0; i != len; i++) {
                        (document.getElementsByClassName("drag_section_part")[i]).style.width = "135px";
                        var searchItem = "";
                        searchItem = (document.getElementsByClassName("drag_section_part")[i]).style.left;
                        searchItem = searchItem.replace("px", "");
                        var idx = postions.findIndex(function (item){
                            return item == searchItem;
                        });
                        if(idx == -1){
                            idx = postions.findIndex(function (item){
                                return item > searchItem;
                            });
                            if (idx != -1)
                                (document.getElementsByClassName("drag_section_part")[i]).style.left = postions[idx-1] +"px";
                            else
                                (document.getElementsByClassName("drag_section_part")[i]).style.left = postions[6] +"px";
                        }

                        (document.getElementsByClassName("drag_section_part")[i]).getElementsByClassName("drag_section_picker")[0].style.width = "100%";
                        (document.getElementsByClassName("drag_section_part")[i]).getElementsByClassName("drag_section_header")[0].style.width = "100%";
                        (document.getElementsByClassName("drag_section_part")[i]).removeAttribute("aria-label");
                    }
                }
                fireEvent('sn_appclient.hide-calender-loading');
            }, 500);
        } else {
            var timer = setTimeout(function() {
                if (document.getElementsByClassName("drag_section_part").length > 0) {
                    var len = document.getElementsByClassName("drag_section_part").length;
                    for (var i = 0; i != len; i++) {
                        (document.getElementsByClassName("drag_section_part")[i]).style.width = "135px";
                        (document.getElementsByClassName("drag_section_part")[i]).style.left = "0px";
                        (document.getElementsByClassName("drag_section_part")[i]).getElementsByClassName("drag_section_picker")[0].style.width = "100%";
                        (document.getElementsByClassName("drag_section_part")[i]).getElementsByClassName("drag_section_header")[0].style.width = "100%";
                        (document.getElementsByClassName("drag_section_part")[i]).removeAttribute("aria-label");
                    }
                }
                fireEvent('sn_appclient.hide-calender-loading');
            }, 500);
        }
    });
    function fireEvent(eventName) {
        window.parent.CustomEvent.fire(eventName, document);
    }
});

function onDoubleClick(itemWindow, ev) {
    ev.preventDefault();
    return false;
}
