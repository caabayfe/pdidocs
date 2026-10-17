(function executeQuery(v_table, v_query) {
    var portalID = v_query.getParameter('portal');

	if (portalID) {
		if (new GlideSPScriptable(portalID).getValue('enable_favorites') == 'false') {
			return;
		}
		
		var favorite = new GlideRecord('sp_favorite');
		favorite.addQuery("user", gs.getUserID());
		favorite.orderByDesc('sys_updated_on');
		favorite.query();

		while (favorite.next()) {
			var row = getRecordDetails(favorite, portalID);
			if (!row.type)
				continue;

			row.portal = portalID;
			v_table.addRow(row);
		}
	}
	
	function getRecordDetails(gr, portalID) {
		var rec = {};
		var refRecord = new GlideRecord(gr.reference_table);
		if (refRecord.get(gr.reference_document)) {
			if (SPFavoriteUtil.canView(refRecord, portalID)) {
				if (refRecord.instanceOf('kb_knowledge')) {
					rec.short_description = refRecord.getDisplayValue('short_description') || '';
					rec.text = refRecord.getDisplayValue('text') || '';
					rec.text = new GlideSPScriptable(portalID).stripHTML(rec.text);
					rec.text = rec.text.substring(0, 200);
					rec.name = refRecord.getValue('number');
					rec.sys_id = refRecord.getValue('sys_id');
					rec.fav_sys_id = gr.getUniqueValue();
					rec.sys_updated_on = gr.getValue('sys_updated_on');
					rec.table_name = refRecord.getTableName();
					rec.type = 'kb';
				}

				else if (refRecord.instanceOf('sc_cat_item_guide')) {
					rec.short_description = refRecord.getDisplayValue('short_description') || '';
					rec.name = refRecord.getDisplayValue('name') || '';
					rec.sys_id = refRecord.getValue('sys_id');
					rec.fav_sys_id = gr.getUniqueValue();
					rec.text = refRecord.getDisplayValue('description') || '';
					rec.text = new GlideSPScriptable(portalID).stripHTML(rec.text);
					rec.text = rec.text.substring(0, 200);
					rec.sys_updated_on = gr.getValue('sys_updated_on');
					rec.table_name = 'sc_cat_item_guide';
					rec.type = 'guide';
					var itemObject = new sn_sc.CatItem(rec.sys_id);
					rec.picture = itemObject.getPicture();
					rec.picture = rec.picture || '';
					rec.picture = rec.picture.substring(0,32);
				}

				else if (refRecord.instanceOf('sc_cat_item') && !refRecord.instanceOf('sc_cat_item_guide')) {
					rec.short_description = refRecord.getDisplayValue('short_description') || '';
					rec.name = refRecord.getDisplayValue('name') || '';
					rec.sys_id = refRecord.getValue('sys_id');
					rec.fav_sys_id = gr.getUniqueValue();
					rec.text = refRecord.getDisplayValue('description') || '';
					rec.text = new GlideSPScriptable(portalID).stripHTML(rec.text);
					rec.text = rec.text.substring(0, 200) ;
					rec.sys_updated_on = gr.getValue('sys_updated_on');
					rec.table_name = 'sc_cat_item';
					rec.type = 'cat_item';
					var itemObject = new sn_sc.CatItem(rec.sys_id);
					rec.picture = itemObject.getPicture();
					rec.picture = rec.picture || '';
					rec.picture = rec.picture.substring(0,32);
				}
				
				else if (refRecord.instanceOf('task')) {
					rec.short_description = refRecord.getDisplayValue('short_description') || '';
					rec.name = refRecord.getDisplayValue('number');
					rec.text = refRecord.getDisplayValue('description') || '';
					rec.text = new GlideSPScriptable(portalID).stripHTML(rec.text);
					rec.text = rec.text.substring(0, 200);
					rec.sys_id = refRecord.getValue('sys_id');
					rec.fav_sys_id = gr.getUniqueValue();
					rec.sys_updated_on = gr.getValue('sys_updated_on');
					rec.table_name = refRecord.getTableName();
					rec.type = 'task';
				}
				else {
					rec.short_description = refRecord.getDisplayValue('short_description') || '';
					rec.name = refRecord.getDisplayValue() || '';
					rec.sys_id = refRecord.getValue('sys_id');
					rec.fav_sys_id = gr.getUniqueValue();
					rec.sys_updated_on = gr.getValue('sys_updated_on');
					rec.table_name = refRecord.getTableName();
					rec.type = 'record';
				}
			}
		}
		return rec;
	}
  })(v_table, v_query);
