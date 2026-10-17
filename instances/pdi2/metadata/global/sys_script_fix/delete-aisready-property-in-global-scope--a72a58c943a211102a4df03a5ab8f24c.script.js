var AIS_NEXT_EXP_SCOPE_ID = '3c467b5f0bf130109e0fa4e6e9c4c946';
var AIS_READY_PROPERTY_NAME = 'glide.ui.polaris.ais_ready';

var propGr = new GlideRecord('sys_properties');
propGr.addQuery('name', AIS_READY_PROPERTY_NAME);
propGr.addQuery('sys_scope', '!=', AIS_NEXT_EXP_SCOPE_ID);
propGr.query();
if (propGr.next()) {
	gs.info('Deleting property ' + AIS_READY_PROPERTY_NAME + ' in scope ' + propGr.sys_scope.name);
	propGr.deleteRecord();
} else
	gs.info('Property ' + AIS_READY_PROPERTY_NAME + ' does not exist in non-AI Search For Next Experience scopes');
