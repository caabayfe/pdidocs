function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
    callback(true);
}

normalizePriority("sn_priority", {
    decimalSeparator: g_user_decimal_separator,
    groupSeparator: g_user_grouping_separator
});

CustomEvent.observe("partial.page.reload", normalizePriority.curry('sn_priority'));
CustomEvent.observe("list.section.toggle", normalizePriority.curry('sn_priority'));
