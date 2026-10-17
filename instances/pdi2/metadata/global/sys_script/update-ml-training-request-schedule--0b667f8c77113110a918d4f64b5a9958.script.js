(function executeRule(current, previous /*null when async*/ ) {
    if (previous.training_frequency != current.training_frequency) {
        new MLRequestSchedule().deleteExistingCapabilityTrainingRequestSchedule(current.sys_id);
        new MLRequestSchedule().insertTrainingRequestSchedule(current.sys_id, current.solution_label, current.training_frequency.toString(), {
            'solutionDefField': 'ml_capability_definition',
            'skipFirstRun': 'true'
        });
    }

})(current, previous);
