addLoadEvent(populateIndexableTables());

function populateIndexableTables() {
	var gm = GlideModal.prototype.get('ais_index_single_table');
    var sysId = gm.getPreference('sys_id');
	var datasource = gm.getPreference('datasource');
	var element = gel('table');
	var option = document.createElement("option");
	option.text = datasource;
	element.add(option);
	var gr = new GlideRecord('ais_child_table');
	gr.addQuery('datasource', sysId);
	gr.addQuery('active', true);
	gr.query();
	while (gr.next()) {
		option = document.createElement("option");
		option.text = gr.getValue('table');
		element.add(option);
	}
}

function index() {
    var table = gel('table').value;
    var gm = GlideModal.prototype.get('ais_index_single_table');
    var sysId = gm.getPreference('sys_id');
	var datasource = gm.getPreference('datasource');

    if (!table) {
        alert(new GwtMessage().getMessage("Please select a table to be indexed"));
        return false;
    }

    var ga = new GlideAjax('AisConfigurationAjax');
    ga.addParam('sysparm_name', 'indexSingleTableNoBlocking');
    ga.addParam('sysparm_ais_datasource', datasource);
    ga.addParam('sysparm_ais_table', table);
    ga.getXML(function(response) {
        var id = response.responseXML.documentElement.getAttribute("answer");
        if (id) {
			var url = '/ais_ingest_datasource_stats.do?sys_id=';
			url += id;
			window.location = url;
		}
    });
}
