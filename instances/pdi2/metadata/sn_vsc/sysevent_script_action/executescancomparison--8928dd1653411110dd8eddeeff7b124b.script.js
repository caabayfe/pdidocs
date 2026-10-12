//Run Comparison Async and update status 
var scan = event.parm2.split(',');
var res1 = new sn_vsc.ScanComparisonUtil().getScanNumber(scan[1]);
var res2 = new sn_vsc.ScanComparisonUtil().getScanNumber(scan[2]);
new sn_vsc.ScanComparisonUtil().runComparison(scan[1], scan[2], scan[0], res1, res2);
if (scan[1] != scan[2]) {
    new sn_vsc.ScanComparisonUtil().runComparison(scan[2], scan[1], scan[0], res1, res2);
}
var gr = new GlideRecord('sn_vsc_scan_comparisons');
gr.get('sys_id', scan[0]);
gr.query();
if (gr.next()) {
    gr.scn_status = 'complete';
    gr.update();
}
