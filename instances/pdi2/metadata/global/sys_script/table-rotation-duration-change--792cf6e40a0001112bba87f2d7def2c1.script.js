updateSchedules();
var model = current.name.toString();
if (model == 'sys_replication_queue')
  SncReplicationEngine.reload();

function updateSchedules() {
   gs.log("Duration changed to " + current.duration + " for rotation " + current.name);
   var schedEntry = new GlideRecord('sys_table_rotation_schedule');
   schedEntry.addQuery('name', current.sys_id);
   schedEntry.orderBy('valid_from');
   schedEntry.query();
   var now = new GlideDateTime();
   var end = new GlideDateTime();
   end.setNumericValue(now.getNumericValue() + current.duration.dateNumericValue());
   var startTime = gs.now();
   while (schedEntry.next()) {
       // Check for in the past entries
       if (schedEntry.valid_from.dateNumericValue() < now.getNumericValue() && 
           schedEntry.valid_to.dateNumericValue() < now.getNumericValue()) {
          continue; 
       }

       // Check for current rotation entry
       if (schedEntry.valid_from.dateNumericValue() < now.getNumericValue()) {
          schedEntry.valid_to.setDateNumericValue(end.getNumericValue());
          schedEntry.setWorkflow(false);
          schedEntry.update();
          startTime = schedEntry.valid_to.getDisplayValue();
          continue;
       }

       // in the future entries
       schedEntry.valid_from = startTime;
       schedEntry.valid_to.setDateNumericValue(schedEntry.valid_from.dateNumericValue() + current.duration.dateNumericValue());
       schedEntry.setWorkflow(false);
       schedEntry.update();
       startTime = schedEntry.valid_to.getDisplayValue();
   }
}
