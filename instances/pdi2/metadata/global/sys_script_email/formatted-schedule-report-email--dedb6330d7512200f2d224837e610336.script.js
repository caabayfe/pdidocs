var log = new GSLog("com.snc.on_call_rotation.log.level", "formatted_schedule_report_email");
log.debug("[formatted_schedule_report_email] event.parm2: " + event.parm2);
var gr = new GlideRecord("v_formatted_schedule_report");
gr.get(event.parm2);
var html = gr.getValue("html_report");
if (!JSUtil.nil(html))
    template.print(html);
