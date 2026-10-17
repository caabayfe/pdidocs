var nowdt = new GlideDateTime();
nowdt.setDisplayValue(gs.nowDateTime());
var gr = new GlideRecord("sys_trigger");
gr.name = current.name + " Assessment Creation";
gr.next_action = nowdt;
// decouple from sys_trigger table  "trigger type" values
if ((gr.evaluation_method).toString() == "survey") {
	switch(current.schedule_period) {
		case 0:
			gr.trigger_type = 2; // sys_trigger trigger type of "On Demand"
			break;
		case 2:
			gr.trigger_type = 0; // sys_trigger trigger type of "Run Once"
			break;
		case 3:
			gr.trigger_type = 3; // sys_trigger trigger type of Day in Week
			break;
		case 4:
			gr.trigger_type = 4; // sys_trigger trigger type of Day in Month
			break;
		case 6:
			gr.trigger_type = 6; // sys_trigger trigger type of Day in Month in Year
			break;
		case 11:
			gr.trigger_type = 11; // sys_trigger trigger type of Daily
			break;
		default:
			gr.trigger_type = current.schedule_period;
	}
} else
	gr.trigger_type = 2;	// sys_trigger type On Demand
gr.run_dayofmonth = nowdt.getDayOfMonth();
gr.run_dayofweek = nowdt.getDayOfWeek();
gr.run_month = nowdt.getMonth();
gr.job_context = "Auto created schedule job for creation of assessments for the assessment type " + current.name;
gr.script = "(new SNC.AssessmentCreation()).createAssessments('" + current.sys_id + "');";
current.job = gr.insert();
