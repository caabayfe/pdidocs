var semGr = new GlideRecord('sys_semaphore');
semGr.addQuery('name', 'Event Management');
semGr.query();
if (semGr.next()) {
   var path = 'em_event.do';
   if(semGr.getValue('path') != path) {
	   semGr.path = path;
	   semGr.update();
	   gs.log('Event Management: sys_semaphore table updated');
   }
} 
