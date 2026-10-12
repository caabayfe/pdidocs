
			function redirectToFormDesign(answer) {
				if (answer != null) {
					var tableName = g_form.getValue('name');
					var url = new GlideURL('$ng_fd.do');
					url.addParam('sysparm_attributes', 'startTable:"' + tableName + '",startView:"Default view"');
					var w = getTopWindow();
					w.popupOpenFocus(url.getURL(), 'edit_form_design', 950, 700, '', false, false);
				}
			}

			function formDesignOnClick() {
				var ajaxHelper = new GlideAjax('TableEditorAjaxProcessor');
				var tableName = g_form.getValue('name');
				ajaxHelper.addParam('sysparm_type', 'loadDefaultFormSection');
				ajaxHelper.addParam('sysparm_tableName', tableName);
				ajaxHelper.getXMLAnswer(this.redirectToFormDesign.bind(this));
			}
			
