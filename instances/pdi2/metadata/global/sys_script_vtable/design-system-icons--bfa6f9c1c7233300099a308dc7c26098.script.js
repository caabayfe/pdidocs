(function executeQuery(v_table, v_query) {
    var icons = new GlideDesignSystemIconRepository();
    var iconsList = icons.getIcons();
    var iterator = iconsList.iterator();

    while (iterator.hasNext()) {
        var icon = iterator.next();
        var iconName = icon.getName();
        var iconLabel = icon.getLabel();
        var svgName = icon.getSVGName();
        var iconId = iconName.replaceAll("-", "_");

        var item = {};
        item.name = iconName;
        item.label = iconLabel;
        item.sys_id = iconId;
        item.icon = svgName;

        v_table.addRow(item);
    }
})(v_table, v_query);
