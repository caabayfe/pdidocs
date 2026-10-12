//ba0871a6cb543200cab07f1b734c9c37 -- Relationship Score Calculation Job
//22f283f3cb001200cab07f1b734c9c12 -- RelationshipCompliance Processor Job
gs.log("Starting disabling relationship health jobs");
var gr = new GlideRecord('sysauto_script');
var ids = ["ba0871a6cb543200cab07f1b734c9c37", "22f283f3cb001200cab07f1b734c9c12"];
gr.addQuery('sys_id', ids);
gr.query();
while(gr.next()){
	gr.setValue('active', 'false');
	gr.update();
}
gs.log("Disabled relationship health jobs");
