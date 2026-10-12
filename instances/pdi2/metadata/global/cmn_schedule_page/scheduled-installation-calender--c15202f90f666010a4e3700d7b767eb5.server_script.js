showCalendar();

function showCalendar() {
    try {
        var encodedQuery = "";
        var viewType = "";
        if (schedulePage.getParameter("start") && schedulePage.getParameter("end")) {
            encodedQuery = "start_timeBETWEENjavascript:gs.dateGenerate('"+schedulePage.getParameter("start") + "')@javascript:gs.dateGenerate('" + schedulePage.getParameter("end") + "')^ORend_timeBETWEENjavascript:gs.dateGenerate('"+schedulePage.getParameter("start") + "')@javascript:gs.dateGenerate('"+schedulePage.getParameter("end") + "')";
            gs.debug("app-client: calender encodedQuery : " + encodedQuery);

            var start = new GlideDate();
            start.setValue(schedulePage.getParameter("start"));
            var end = new GlideDate();
            end.setValue(schedulePage.getParameter("end"));
            var duration = GlideDate.subtract(start, end);
            if (duration.getDayPart() == 1)
                viewType = "daily";
            else if (duration.getDayPart() == 7)
                viewType = "weekly";
            else
                viewType = "monthly";

            gs.debug("app-client: calender duration: " + duration.getDisplayValue());
        }

        var schedules = new GlideRecord('sys_installation_schedule');
        if (encodedQuery)
            schedules.addEncodedQuery(encodedQuery);
        else
            schedules.addEncodedQuery("start_time>=javascript:gs.beginningOfLastMonth()");
        schedules.query();
        while (schedules.next()) {
            var scheduleItem = new GlideRecord('sys_installation_schedule_item');
            scheduleItem.addQuery("schedule", schedules.getValue("sys_id"));
            scheduleItem.query();
            var noOfItems = scheduleItem.getRowCount();
            if (!scheduleItem.next())
                continue;
            var logo = getLogoInfo(scheduleItem);
            var endTime = new GlideDateTime(schedules.getValue("end_time"));
            addEvent(schedules, (schedules.getValue("name")).slice(0, -19), endTime, logo, viewType);
        }
    } catch (ex) {
        gs.log('Scheduled Calender error : ' + ex.message);
    }
}

function addEvent(schedules, scheduleItemName, endTime, logo, viewType) {
    var stTime = new GlideDateTime(schedules.getValue("start_time"));
    var eventDate = schedulePage.addItem(schedules, stTime.getDisplayValue(), endTime.getDisplayValue(), schedules.getValue("name"), '#D8EAFD');
    if (eventDate == null)
        return;
    eventDate.setReadOnly(true);

    if (viewType == 'monthly') {
        eventDate.setName('<span class="schedule-description" style="index: 0; top: 3px; position: absolute; left: 32px;" data-toggle="tooltip" data-placement="top" data-trigger="focus" title="' + scheduleItemName + '">' +
            ' <span class="margin-left-3" ><img src="' + logo + '" width="20" height="20"/></span>' +
            scheduleItemName +
            "</span>");
        return;
    }

    if (viewType == 'weekly') {
        eventDate.setName('<span class="schedule-description-weekly" style="index: 0; top: 3px; position: absolute; left: 64px;" data-toggle="tooltip" data-placement="top" data-trigger="focus" title="' + scheduleItemName + '">' +
            ' <span class="margin-left-3"><img src="' + logo + '" width="20" height="20"/></span>' +
            scheduleItemName +
            "</span>");
        return;
    }
    eventDate.setName('<span class="margin-left-5" style="index: 0; top: 3px; position: absolute; left: 64px;" data-toggle="tooltip" data-placement="top" data-trigger="focus" title="' + scheduleItemName + '">' +
        ' <span ><img src="' + logo + '" width="20" height="20"/></span>' +
        scheduleItemName +
        "</span>");
    return;


}

function getLogoInfo(scheduleItem) {
    if (scheduleItem.product && scheduleItem.getValue("product").length() != 0 && scheduleItem.getValue("product") != 'undefined')
        return "../images/app_store/nowlogo.png";

    if (scheduleItem.is_plugin)
        return "images/plugin_activate.gifx";

    var logo = getLogoURL(scheduleItem.getValue("source_app_id"));
    if (logo && logo.length != 0)
        return logo;

    logo = new GlideRecord('sys_attachment');
    logo.addQuery('table_sys_id', scheduleItem.source_app_id);
    logo.addQuery('file_name', 'logo');
    logo.query();
    if (logo.next())
        return logo.getValue("sys_id") + ".iix";

    return "";
}

function getLogoURL(sourceAppId) {
    if(gs.getProperty("sn_appclient.app.install.offline", "false") == "true")
        return "";
    var app = getApp(sourceAppId);
    if (app == null)
        return "";
    var logoSysId = app.getValue('logo');
    if (logoSysId && logoSysId != 'undefined')
        return getStoreURl() + logoSysId + ".iix";
    return "";
}

function getStoreURl() {
    var resultURL = "";
    resultURL = gs.getProperty("sn_appclient.repository_base_url", "https://store.servicenow.com/");
    var isDev = gs.getProperty("glide.installation.developer", "false") == "true";
    if (isDev)
        resultURL = gs.getProperty("sn_appclient.dev_repository_base_url", "http://localhost:8080/");

    var overrideUrl = gs.getProperty("sn_appclient.upload_base_url");
    if (gs.nil(overrideUrl))
        overrideUrl = gs.getProperty("sn_appauthor.upload_base_url");

    if (!gs.nil(overrideUrl) && overrideUrl.startsWith("http"))
        resultURL = overrideUrl;

    if (!resultURL.endsWith("/"))
        resultURL += "/";

    return resultURL;
}

function getApp(sourceAppId) {
    var gr = new GlideRecord("sys_remote_app");
    gr.addActiveQuery();
    gr.addQuery("sys_id", sourceAppId);
    gr.query();
    if (gr.next())
        return gr;

    gr = new GlideRecord("sys_store_app");
    gr.addQuery("sys_id", sourceAppId);
    gr.query();
    if (gr.next())
        return gr;

    return null;
}
