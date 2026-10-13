var rec = new GlideRecord('sysauto_script');
rec.get('name', 'Operational Intelligence - Metric configuration job');
SncTriggerSynchronizer.executeNow(rec);
var message = gs.getMessage('Scheduled metric config sync job');
gs.addInfoMessage(message);
