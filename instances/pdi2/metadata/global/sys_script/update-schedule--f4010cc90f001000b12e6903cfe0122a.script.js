updateSchedule();

function updateSchedule() {
   var gr = current.schedule.getRefRecord();
   if (!gr.isValid())
      return;

   gr.setForceUpdate(true);
   gr.update();
}
