var DIRECTION=2;// 0-downstream,  1-upstream,  2-both way

var filterSonsOfHardware = false; // setting to true will filter all out-going connections out of host (when the host is added to the map it won't add new connections out of (or in to) it)

var filterTraffic = false;  //setting to true will filter all traffic-based conenctions

dependency_views_script();


function isTraffic(sysId) {
	if (!filterTraffic)
		return false;
	var trafficGr = new GlideRecord('cmdb_ci_qualifier_traffic_based_connection');
	return trafficGr.get(sysId);		
}

function isHardware(sysId) {
	if (!filterSonsOfHardware)
		return false;
	var grHar = new GlideRecord('cmdb_ci_computer');
	return grHar.get(sysId);		
}

function dependency_views_script() {
		
    var result = [];
                     
	if ((!isHardware(dv_ci_id)) && (!isTraffic(dv_ci_id))) {
               
		var gr = new GlideRecord('cmdb_rel_ci');
		var dir = (DIRECTION==1) ? 'child' : 'parent'; //default is downstream
		var qc = gr.addQuery(dir, dv_ci_id);
               
		if (DIRECTION==2){
			qc.addOrCondition('child', dv_ci_id);//Add also up stream for both way
		}

		gr.query();
                            
		while (gr.next()) {

			if ((!isTraffic(gr.child)) && (!isTraffic(gr.parent))){
				result.push({
					"dv_ci_id": (gr.parent == dv_ci_id) ? String(gr.child) :String(gr.parent) ,
					"dv_downstream": String(gr.parent == dv_ci_id) ,
					"dv_rel_id": String(gr.sys_id),
					"dv_rel_type": String(gr.type)
				});
			}
		}
	} 
                //gs.log("\n\n\n\n@@@BSMCustomGraph->script->IN CI[" + dv_ci_id + "]  Level["+dv_level+"] \n\n###OUT-" + JSON.stringify( result ,null, 2));
               
    return result;
}
