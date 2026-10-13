current.status='Scheduled';
current.update();
var rec = new GlideRecord('sysauto_script');
rec.get('name', 'Operational Intelligence - Anomaly Model Test');
SncTriggerSynchronizer.executeNow(rec);
var infoMessage = gs.getMessage("Scheduled 'Anomaly Model Test Job'");
gs.addInfoMessage(infoMessage);
