current.addQuery('status', parent.sys_id);
current.addQuery('sys_created_on', '>=', parent.sys_created_on);
var boundary = new GlideDateTime(parent.sys_updated_on + '');
var offset = new GlideTime(1260000);  // time in ms.  20 min from quota transaction timeout + 1 min buffer
boundary.add(offset);
current.addQuery('sys_created_on', '<=', boundary.getValue());
