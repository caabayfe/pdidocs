initializeRotation();

function initializeRotation() {
   var model = current.name.toString();
   var itables = getRotationLength();
   var tr = new SNC.TableRotationUtil();
   var start = gs.nowDateTime();
   var firstRotation = start;
   for (var i = 0; i < itables; i++) {
      var frn = tr.create(model);
      if (!frn) 
         break;

      var fse = addScheduleEntry(frn, start);
      start = fse.valid_to.getDisplayValue();
   }  

   addBaseEntry(model, firstRotation);
   var ru = new GlideRecord(current.getTableName());
   ru.get(current.sys_id);
   ru.initialized = true;
   ru.update();
} 

function getRotationLength() {
   if (current.rotations.isNil())
      return 8;

   return current.getValue('rotations');
}

function addScheduleEntry(rotationName, startTime) {
   var schedEntry = new GlideRecord('sys_table_rotation_schedule');
   schedEntry.name = current.sys_id;
   schedEntry.table_name = rotationName;
   schedEntry.valid_from = startTime;
   schedEntry.valid_to.setDateNumericValue(schedEntry.valid_from.dateNumericValue() + current.duration.dateNumericValue());
   schedEntry.insert();
   return schedEntry;
}


function addBaseEntry(rotationName, endTime) {
   var schedEntry = new GlideRecord('sys_table_rotation_schedule');
   schedEntry.name = current.sys_id;
   schedEntry.table_name = rotationName;
   schedEntry.valid_from.setDateNumericValue(0);
   schedEntry.valid_to = endTime;
   schedEntry.insert();
   return schedEntry;
}
