(function refineQuery(current, parent) {
    var parentContextId = parent.getUniqueValue();
    current.addQuery(sn_nb_action.Constants.COL_MAP_PARENT_CONTEXT, parentContextId);
    // Add your code here, such as current.addQuery(field, value);
})(current, parent);
