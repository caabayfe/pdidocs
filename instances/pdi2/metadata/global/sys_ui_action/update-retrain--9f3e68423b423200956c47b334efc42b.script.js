var result = current.update();

if (current.active && result != null) {
	new MLRequestSchedule().deleteExistingTrainingRequestSchedule(current.sys_id);
	new MLRequestSchedule().insertTrainingRequestSchedule(current.sys_id, current.solution_label, current.training_frequency.toString());
}
