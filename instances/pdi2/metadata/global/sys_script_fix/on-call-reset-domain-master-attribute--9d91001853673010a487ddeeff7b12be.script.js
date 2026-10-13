var shiftContactPrefGr = new GlideRecord('sys_dictionary');	
shiftContactPrefGr.get('name', 'cmn_rota_contact_preference');	
var ga = new GlideAttributes(shiftContactPrefGr.attributes);	
if (ga.containsAttribute('domain_master')) {	
    ga.setAttribute('domain_master', 'group');
    shiftContactPrefGr.attributes = ga.serializeAttributes();	
    shiftContactPrefGr.update();
}
