(function refineQuery(current, parent) {

    // Add your code here, such as current.addQuery(field, value);
    current.addQuery('category', parent.sys_id);
    current.addNotNullQuery('parent_category');

})(current, parent);
