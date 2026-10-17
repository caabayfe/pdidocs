var oldExclusionTable = 'itom_licensing_exclusion_metadata';
var newExclusionTable = 'itom_license_exclusion_metadata';
var itomSkuSysId = new sn_itom_license.ITOMLicensingUtils().skuSysId['itom'];
//These conditions are OOB added to new exclusion metadata table
var excludeSysIds = ['890a8e85c7131010b92c660703c2609b', '899927141b4d2850bc7e76e48d4bcb29', '8cd9c6d0db2be0104f2ced384b9619f9'];
var gr = new GlideRecord(oldExclusionTable);
gr.addQuery('sys_id', 'NOT IN', excludeSysIds);
gr.query();
while (gr.next()) {
    var newGr = new GlideRecord(newExclusionTable);
    newGr.addQuery('query', gr.getValue('condition'));
    newGr.addQuery('value_stream', gr.getValue('value_stream').toLowerCase());
    newGr.addQuery('category', gr.getValue('category'));
    newGr.addQuery('table_name', gr.getValue('table_name'));
    newGr.query();
    if (!newGr.next()) {
        newGr.initialize();
        //  only itom sku was availabe earlier
        newGr.setValue('sku_type', itomSkuSysId);
        newGr.setValue('value_stream', gr.getValue('value_stream').toLowerCase());
        newGr.setValue('category', gr.getValue('category'));
        newGr.setValue('active', gr.getValue('active'));
        newGr.setValue('condition_type', 'attribute');
        newGr.setValue('table_name', gr.getValue('table_name'));
        newGr.setValue('query', gr.getValue('condition'));
        newGr.setValue('ci_identifier', 'sys_id');
        newGr.setValue('description', 'Custom Exclusion Rule');
        newGr.insert();
    }
}
