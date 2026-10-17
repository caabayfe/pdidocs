var dump = SNC.StatsManager.threadDump();
var gr = new GlideRecord('sys_thread_dump');
gr.initialize();
gr.setValue('thread_dump', dump);
gr.insert();
