restAPIWithoutAccessPolicy();

function restAPIWithoutAccessPolicy() {
    var totalRec = 0;
    var gr = new GlideRecord('sys_script_include');
    // get the access of RESTAPIServiceInfo 
    if (gr.get('694a273e670210106fcfecccb585ef08')) {
        accessVal = gr.getValue("access");
    }
	// run the script only if there is access, otherwise return 0
    if (accessVal === 'public') {
        new sn_vsc.SCAuthUtil().getAPIWithoutPolicy();
        var ga = new GlideAggregate('sc_rest_api_without_access_policy');
        ga.addAggregate('COUNT');
        ga.query();

        if (ga.next()) {
            totalRec = ga.getAggregate('COUNT');
        }
    }

    return totalRec;
}
