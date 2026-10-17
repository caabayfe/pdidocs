if (isCancelOnReject())
  cascadeUp();

function cascadeUp() {
    var request_item = new GlideRecord('sc_req_item');
    request_item.addQuery('sys_id', current.request_item);
    request_item.query();
    if (request_item.next()) {
        if (request_item.approval != 'rejected') {
            request_item.stage = 'Request Cancelled';
            request_item.approval = 'rejected';
            request_item.update();
        }        
    }
}

function isCancelOnReject() {
   var dt = new GlideRecord('sc_cat_item_dt_approval');
   dt.addQuery('sys_id', current.delivery_task);
   dt.query();
   if (dt.next()) {
     var opt = dt.upon_reject + '';
     return (opt == 'cancel');
   }

   return false;
}
