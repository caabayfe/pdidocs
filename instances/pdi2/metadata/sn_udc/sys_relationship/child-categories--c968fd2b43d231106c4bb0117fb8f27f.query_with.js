(function refineQuery(current, parent) {

    // Add your code here, such as current.addQuery(field, value);
    current.addQuery('parent_category', parent.sys_id);

})(current, parent);
