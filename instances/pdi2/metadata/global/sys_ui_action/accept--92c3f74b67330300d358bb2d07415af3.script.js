current.state = 3;
current.update();
action.setRedirectURL(current);
gs.eventQueue('kb_feedback_task.resolution_accepted',current,current.assigned_to,current.assigned_to.first_name);
