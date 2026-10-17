var report = new GlideReport(current.sys_id);
var rootReport = report.getRootReport();
answer = report.isValid() && rootReport.sys_class_name == "sys_report" && rootReport.canRead();
