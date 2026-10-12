current.update();
SncTriggerSynchronizer.executeNow(current);
var message = 'Data Collection Job {0} has been started';
gs.addInfoMessage(gs.getMessage(message, '<a href="/sysauto_pa.do?sys_id=' + current.sys_id + '">' + current.name + '</a>'));
