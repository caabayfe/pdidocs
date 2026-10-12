current.state = 2;
current.update();
action.setRedirectURL(current);
gs.eventQueue('kb_feedback_task.resolution_rejected',current,current.assigned_to,current.assigned_to.first_name);
