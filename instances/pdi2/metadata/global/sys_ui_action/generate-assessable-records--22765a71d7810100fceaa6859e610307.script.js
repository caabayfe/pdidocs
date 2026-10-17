current.update();
(new SNC.AssessmentCreation()).createAssessableRecords(current);
action.setRedirectURL("asmt_assessable_record_list.do?sysparm_query=metric_type=" + current.sys_id);
var msg = gs.getMessage("The assessable records were generated successfully.");
gs.addInfoMessage(msg);
