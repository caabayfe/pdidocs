var catalogs = (current.sc_catalogs.toString()).split(',');
var result = (catalogs.length!=0);
for (var i = 0; i<catalogs.length;i++) {
	var gr =new GlideRecord('sc_catalog');
	gr.get(catalogs[i]);
	var editors = gr.getValue('editors');
	if (gr.getValue('manager')!=gs.getUserID() && (JSUtil.nil(editors) || editors.indexOf(gs.getUserID())==-1)) {
		result=false;
		break;
	}
}
answer=result;
