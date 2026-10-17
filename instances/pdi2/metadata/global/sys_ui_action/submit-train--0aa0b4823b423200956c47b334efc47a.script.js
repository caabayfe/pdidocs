var result = current.insert();
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);
if (current.active && result != null) {
	new MLRequestSchedule().deleteExistingTrainingRequestSchedule(current.sys_id);
	new MLRequestSchedule().insertTrainingRequestSchedule(current.sys_id, current.solution_label, current.training_frequency.toString());
}
