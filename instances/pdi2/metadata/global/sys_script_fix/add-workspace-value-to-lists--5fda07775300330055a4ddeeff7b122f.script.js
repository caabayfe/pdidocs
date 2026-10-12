
var wsSysId = "7b24ceae5304130084acddeeff7b12a3";
var wsListGr = new GlideRecord('sys_aw_list');
wsListGr.addNullQuery("workspace");
wsListGr.setValue("workspace", wsSysId);
wsListGr.updateMultiple();


var wsListCatGr = new GlideRecord('sys_aw_list_category');
wsListCatGr.addNullQuery("workspace");
wsListCatGr.setValue("workspace", wsSysId);
wsListCatGr.updateMultiple();
