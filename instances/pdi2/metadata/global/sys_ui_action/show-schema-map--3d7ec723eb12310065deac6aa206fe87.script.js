function showSchemaMapOnClick() {
	var tableName = g_form.getValue('facts_table');
	if (!tableName || tableName === '') return;
	var url = 'generic_hierarchy_erd.do?' +
			'sysparm_attributes=table_history=,table=' + tableName + ',show_internal=true,' +
			'show_referenced=true,show_referenced_by=true,show_extended=true,' +
		    'show_extended_by=true,table_expansion=,spacing_x=60,spacing_y=90,nocontext';
	var w = getTopWindow();
	w.popupOpenFocus(url, 'show_schema_map', 950, 700, '', false, false);
}

$j(function() {
    var relatedLink = $j('a[id="3d7ec723eb12310065deac6aa206fe87"]'),
        factsTableEl = $j('div[id="element.pa_cubes.facts_table"] .form-field-addons'),
        html = relatedLink[0].outerHTML;
    html = '<span style="display:inline-block;width:260px;padding:0.5em 0 0 4px;">' + html + '</span>';
    factsTableEl.html(html);
});
