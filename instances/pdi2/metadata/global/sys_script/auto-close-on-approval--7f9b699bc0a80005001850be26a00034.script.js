fetchAndCheckDeliveryTask();


function fetchAndCheckDeliveryTask() {
   var approval = new GlideRecord('sc_cat_item_dt_approval');
   approval.addQuery('sys_id', current.delivery_task);
   approval.query();
   if (approval.next()) {
      if (approval.upon_approval == 'proceed') {
          current.active = false;
          current.work_end = nowDateTime();
      }
   }
}
