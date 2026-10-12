var gm = GlideModal.get();
    var template = gm.getPreference('sysparm_template');
    var topic = gm.getPreference('sysparm_topic');
    var options = gm.getPreference('sysparm_portals');
    var select = document.getElementById('portalField');

    for (var i = 0; i<options.length; i++){
        var opt = document.createElement('option');
        opt.value = options[i].id;
        opt.innerHTML = options[i].name;
        select.appendChild(opt);
    }

function ok (){
	var selected = document.getElementById("portalField");
	var portalId = selected.value;
	
	var value = 'esc'; //Fallback Portal
	for(var i=0; i<options.length; i++) {
		if(options[i].id == portalId) {
			value = options[i].url;
            		break;
		}
	}
	url = '/'+value+'?id=' + template + '&topic_id=' + topic;
    	g_navigation.open(url, '_blank');
    	GlideModal.get().destroy();
    	return false;
}

function cancel(){
    GlideModal.get().destroy();
    return false;
}
