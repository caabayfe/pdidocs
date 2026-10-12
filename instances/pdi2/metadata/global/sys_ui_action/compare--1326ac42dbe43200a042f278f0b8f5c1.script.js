function compare() {
	var ids = g_list.getChecked().split(",");
	if (ids.length > 2) {
		alert(new GwtMessage().getMessage("You can only compare two versions at a time"));
		return;
	}
	else if(ids.length<2){
		alert(new GwtMessage().getMessage("Select two versions to compare"));
	}
	else {
		window.location = "kb_compare.do?sysparm_v1="+ids[0]+"&sysparm_v2="+ids[1];
	}
}
