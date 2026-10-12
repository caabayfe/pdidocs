var snboqId = current.getValue("sys_id");
var snboqType = current.getValue("job_qualified_name");

if (snboqType === "@dotwalk/atf-bootstrap/TestGenerationSNBOQJob") {
	new SNBOQCleanup().cancelTestGen(snboqId, gs.getMessage("ATF_TG:tracker_message_boq_record_cancelled"));
	
} else if (snboqType === "@dotwalk/atf-test-runner-server/TestRunSNBOQJob") {
	new SNBOQCleanup().cancelTestRun(snboqId, gs.getMessage("ATF_TG:tracker_message_boq_record_cancelled"));
	
} else {
	throw "Job with qualified name " + snboqType + " is not supported";
}

current.setValue("state", "completed");
current.update();
