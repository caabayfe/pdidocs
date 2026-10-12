answer=true;
var gr = new GlideRecord("sys_cs_auto_resolution_configuration");
if(gr.get('sys_id', 'feda6b70072120109c3e59bf1ad30010')){
	if(gr.getValue('active') == '1'){
		answer = false;
	}
}
