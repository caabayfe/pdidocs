/**
 * This server-side script is used to dynamically create actions for the context menu, such as the list of available labels
 *
 * The following variables are available to the script:
 *    'g_tableName' the name of the current table
 *    'g_listId' the id of the list we are building the context menu for
 *
 * Add items to the context menu by calling:
 *    g_contextMenu.addAction(item_id, label, script_string, order);
 */
buildContextActions();

function buildContextActions() {
	var td = GlideTableDescriptor.get(g_tableName);
	var ed = td.getED();
	if (ed.getBooleanAttribute('no_labels', false))
		return;
	var maxLabels = 8;
	var labels = GlideLabelUtil.getRecentDisplayLabelsForUser(maxLabels + 1);
	var optionOrder = 100;
	g_contextMenu.addAction("--newTag--", gs.getMessage("New Tag..."), "assignNewLabelAction()", optionOrder++);
	for (var i = 0; i < labels.size() && i < maxLabels; i++) {
                var rawLabel = labels.get(i);
                if (rawLabel == null) continue;
    
                var currentLabel = Packages.org.apache.commons.lang.StringEscapeUtils.escapeXml(rawLabel);
                var safeLabel = String(rawLabel).replace(/'/g, "\\'").replace(/"/g, '\\"');
                g_contextMenu.addAction('assign_label', currentLabel, "assignLabelAction('" + safeLabel + "')", optionOrder++);
	}
	if (labels.size() > maxLabels)
		g_contextMenu.addAction("--moreTags--", gs.getMessage("More..."), "promptWithMoreTagChoices()", optionOrder++);
}
