answer = new global.ProminACLUtil(current.scheduled_task.model_def_version.project).canRead() && new global.ProminACLUtil(current).canReadTaskMiningProject();
