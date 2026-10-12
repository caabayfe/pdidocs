var total_arr = {};
var gr_bulk_service = new GlideRecord('cmdb_convert_bulk_services');
gr_bulk_service.addQuery('status',['READY','IN PROGRESS']);
gr_bulk_service.query();
while(gr_bulk_service.next()) {
  var bulk_id = gr_bulk_service.getValue('sys_id');
  populate_total(bulk_id);
  pupulate_for_status(bulk_id,'COMPLETE');
  pupulate_for_status(bulk_id,'FAILED');
  pupulate_for_status(bulk_id, 'IN PROGRESS');
  if(total_arr.hasOwnProperty(bulk_id)) {
    var ipc = Number(total_arr[bulk_id].inprogress);
    var fc = Number(total_arr[bulk_id].failed);
    var cc = Number(total_arr[bulk_id].completed);
    var tc = Number(total_arr[bulk_id].total);
    var current_count = ipc + fc + cc;
    var percent = Math.floor(current_count * 100 / tc);
    gr_bulk_service.setValue('progress', percent);
    var status = 'READY';
    if(ipc > 0)
      status = 'IN PROGRESS';
    else if(fc > 0 && fc + cc == tc)
      status = 'COMPLETED_WITH_FAILURE';
    else if(cc == tc)
      status = 'COMPLETE';

    if(status != 'READY')
      gr_bulk_service.setValue('status', status);

    gr_bulk_service.update();
  }
}


function populate_total(bulk_id) {
  var gr_entry_total = new GlideAggregate('cmdb_convert_bulk_services_entry');
  gr_entry_total.addAggregate('COUNT');
  gr_entry_total.addQuery('bulk_transform', bulk_id);
  gr_entry_total.groupBy('bulk_transform');
  gr_entry_total.query();
  var t = 0;
  var temp_progress = {};
  if(gr_entry_total.next()) {
    t = gr_entry_total.getAggregate('COUNT');
  }
  temp_progress.total = t;
  total_arr[bulk_id] = temp_progress;
}


function pupulate_for_status(bulk_id, status) {
  var gr_entry_completed = new GlideAggregate('cmdb_convert_bulk_services_entry');
  gr_entry_completed.addQuery('status',status);
  gr_entry_completed.addQuery('bulk_transform', bulk_id);
  gr_entry_completed.addAggregate('COUNT');
  gr_entry_completed.groupBy('bulk_transform');
  gr_entry_completed.query();
  var c = 0;
  if(gr_entry_completed.next()){
    c = gr_entry_completed.getAggregate('COUNT');
  }
  switch(status) {
    case 'COMPLETE':
      total_arr[bulk_id].completed = c;
      break;
    case 'FAILED':
      total_arr[bulk_id].failed = c;
      break;
    case 'IN PROGRESS':
      total_arr[bulk_id].inprogress = c;
      break;
  }
}
