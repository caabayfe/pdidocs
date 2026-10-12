(function refineQuery(current, parent) {

    // Add your code here, such as current.addQuery(field, value);
    var m2mGr = current.addJoinQuery("sn_udc_file_taxonomy_type_category_m2m");
    m2mGr.addCondition('category', parent.sys_id);

})(current, parent);
