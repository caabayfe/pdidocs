current.addQuery('email', parent.sys_id);

var date = parent.sys_created_on.getGlideObject().getDisplayValueInternal().split(' ')[0];
var dateend = new GlideDateTime().getDisplayValueInternal().split(' ')[0];

current.addQuery('sys_created_on', '>=',gs.dateGenerate(date, 'start'));
current.addQuery('sys_created_on', '<=',gs.dateGenerate(dateend, 'end'));
