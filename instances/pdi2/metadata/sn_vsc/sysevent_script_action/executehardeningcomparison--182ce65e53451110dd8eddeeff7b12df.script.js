//Run Comparison Aync and update status 
var harc = event.parm2.split(',');
var settings = new sn_vsc.SCComparisonUtil().runComparison(harc[1], harc[2]);
new sn_vsc.SCComparisonUtil().createChangedSettings(harc[0], settings);
var gr = new GlideRecord('sn_vsc_user_comparisons');
gr.get('sys_id', harc[0]);
gr.query();
if (gr.next()) {
    gr.usr_status = 'complete';
    gr.update();
}
