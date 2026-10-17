
			var updateXmlGR = new GlideRecord('sys_update_xml');
			updateXmlGR.addQuery('update_set', current.sys_id);
			updateXmlGR.setLimit(1);
			updateXmlGR.query();
			if (updateXmlGR.hasNext()) {
				current.setAbortAction(true);
				gs.addErrorMessage(gs.getMessage('You cannot change the application of an update set that contains updates'));
			}
			
