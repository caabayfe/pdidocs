gs.info('Setting the "collect" column to "Both scores and text" in all PA Jobs');
var gr = new GlideRecord('sysauto_pa');
gr.addQuery('run_type', '!=', 'once');
gr.addNullQuery('collect');
gr.setValue('collect', 'scores_text');
gr.updateMultiple();
gs.info('Done setting the value of "collect" column to "Both scores and text"');
