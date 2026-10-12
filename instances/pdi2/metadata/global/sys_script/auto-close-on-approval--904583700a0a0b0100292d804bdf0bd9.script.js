if (current.delivery_task.upon_approval == 'proceed') {
  current.active = false;
  current.work_end = nowDateTime();
} 
