function normalizePriority(columnName, separators) {
    var decimalSeparator = '.';
    var groupSeparator = ',';
    if(separators){
        decimalSeparator = separators.decimalSeparator;
        groupSeparator = separators.groupSeparator;
    }
    
    var index = getIndexByColumn(columnName);
    //apply only on em_alert table and not on related lists
    if (jQuery("div#em_alert_list").length) {
        jQuery("tbody.list2_body tr.list_row:not([smart-priority-override])").each(function() {
            var row = jQuery(this);
            var cell = jQuery(row.find("td:not(.list_decoration_cell)")[index]);
            var value = cell.text();
            if (!value)
                return;

            value = value.replaceAll(groupSeparator, "").replaceAll(decimalSeparator, ".");
            if (isNaN(value))
                return;

            var priority = parseInt(parseInt(value) / 1000);
            cell.text(priority);
            row.attr("smart-priority-override", "true");
        });
    }
}

function getIndexByColumn(name) {
    var index = -1;
    jQuery("thead th.list_header_cell").each(function(idx) {
        var curr = jQuery(this);
        if (curr.attr('name') === name) {
            if (index == -1) {
                index = idx;
            }
        }
    });

    return index;
}
