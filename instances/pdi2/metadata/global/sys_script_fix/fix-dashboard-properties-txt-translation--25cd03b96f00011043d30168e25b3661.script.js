//property 1
var newProp1 = new GlideRecord('sys_properties');

//property 2
var newProp2 = new GlideRecord('sys_properties');

//property 3
var newProp3 = new GlideRecord('sys_properties');

//property 4
var newProp4 = new GlideRecord('sys_properties');

//run only if all 4 newly created properties are available 
if (newProp1.get('19a6f2ec6ff3701094b40168e25b3631') && newProp2.get('f789fe206f37701094b40168e25b3695') && newProp3.get('ece932606f37701094b40168e25b3631') && newProp4.get('b21a36606f37701094b40168e25b3622')) {

    //want following code to only run on upgrade 
    if (!pm.isZboot()) {
        var previousRecords = new GlideRecord('sys_properties');
        //getting all 4 records existing records to update 
        gs.info("inside upgrade");
        previousRecords.addEncodedQuery('name=glide.canvas.grid.widget_performance_threshold^ORname=glide.canvas.grid.widget_cache_ttl^ORname=glide.canvas.grid.widget_render_concurrent_max^ORname=glide.cms.enable.responsive_grid_layout');
        previousRecords.query();

        while (previousRecords.next()) {

            gs.info("previous record is " + previousRecords.name);
            //changing the value of all 4 newly created records(with similar name just added sufix "_fix") to  the value of old records

            var record = previousRecords.getValue('name') + '_fix';
            if (record == newProp1.name) {
                newProp1.value = previousRecords.value;
                newProp1.update();
            } else if (record == newProp2.name) {
                newProp2.value = previousRecords.value;
                newProp2.update();
            } else if (record == newProp3.name) {
                newProp3.value = previousRecords.value;
                newProp3.update();
            } else if (record == newProp4.name) {
                newProp4.value = previousRecords.value;
                newProp4.update();
            }

        }

        // point the categories of the old records to the new records by changing its property attribute
        var categoryTableProp1 = new GlideRecord('sys_properties_category_m2m');
        if (categoryTableProp1.get('0cb35892b310030037c482ff86a8dca4')) {
            categoryTableProp1.property = newProp1.sys_id;
            categoryTableProp1.update();
        }

        //repeat the steps for all 4 
        //property 2
        var categoryTableProp2 = new GlideRecord('sys_properties_category_m2m');
        if (categoryTableProp2.get('04b35892b310030037c482ff86a8dca6')) {
            categoryTableProp2.property = newProp2.sys_id;
            categoryTableProp2.update();
        }

        //property 3
        var categoryTableProp3 = new GlideRecord('sys_properties_category_m2m');
        if (categoryTableProp3.get('88b3d492b310030037c482ff86a8dca4')) {
            categoryTableProp3.property = newProp3.sys_id;
            categoryTableProp3.update();
        }

        //property 4
        var categoryTableProp4 = new GlideRecord('sys_properties_category_m2m');
        if (categoryTableProp4.get('0cb35892b310030037c482ff86a8dca7')) {
            categoryTableProp4.property = newProp4.sys_id;
            categoryTableProp4.update();
        }

        //delete the all old 4 records 
        previousRecords.deleteMultiple();
        gs.info("records has been deleted");
    }
    //update the name of new records to the old records 
    newProp1.name = 'glide.canvas.grid.widget_performance_threshold';
    newProp1.update();
    newProp2.name = 'glide.canvas.grid.widget_render_concurrent_max';
    newProp2.update();
    newProp3.name = 'glide.cms.enable.responsive_grid_layout';
    newProp3.update();
    newProp4.name = 'glide.canvas.grid.widget_cache_ttl';
    newProp4.update();
}
