var sc = new SLACalculator();
//sc.setDebug(true);
if (!current.end_time.nil()) {
   sc.setNow(current.end_time);
}
sc.loadTaskSLA(current);
sc.calcTaskSLAs();
sc.updateTaskSLAs(current, true);

//Set the stage field
if (!current.end_time.nil() && current.stage != 'cancelled') {
   current.stage = sc.getTaskSLAStage(current);
}
