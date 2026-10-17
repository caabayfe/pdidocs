function showSchemaMapOnClick() {
	var tableName = $j('[id="sys_ui_hp_cascading_filter.table"]').val();
	if (!tableName || tableName === '') return;
	var url = 'generic_hierarchy_erd.do?' +
			'sysparm_attributes=table_history=,table=' + tableName + ',show_internal=true,' +
			'show_referenced=true,show_referenced_by=true,show_extended=true,' +
		    'show_extended_by=true,table_expansion=,spacing_x=60,spacing_y=90,nocontext';
	var w = getTopWindow();
	w.popupOpenFocus(url, 'show_schema_map', 950, 700, '', false, false);
}

$j(function() {
    var relatedLink = $j('a[id="cfd60355c7532200aa4b8b3c5c9763e4"]'),
        factsTableEl = $j('div[id="element.sys_ui_hp_cascading_filter.table"] .form-field-addons'),
        html = relatedLink[0].outerHTML;
    html = '<span style="display:inline-block;width:260px;padding:0.5em 0 0 4px;">' + html + '</span>';
    factsTableEl.html(html);
});
