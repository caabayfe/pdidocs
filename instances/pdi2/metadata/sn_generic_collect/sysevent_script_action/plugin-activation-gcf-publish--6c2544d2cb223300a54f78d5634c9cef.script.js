var sm = new GCFSampleMap();
sm.put('plugin_id', '' + event.parm1);
sm.put('first_level', '' + event.parm2);

GCFCollector.recordUsageEvent('plugins', 'plugin', 'activate', sm);
