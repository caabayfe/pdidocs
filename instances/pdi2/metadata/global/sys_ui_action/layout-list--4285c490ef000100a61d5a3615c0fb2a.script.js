			function redirectToListLayout(answer) {
				if (answer != null) {
					personalizeList(answer, g_form.getValue('name'));
				}
			}

			function listLayoutOnClick() {
				var ajaxHelper = new GlideAjax('TableEditorAjaxProcessor');
				var tableName = g_form.getValue('name');
				var transactionScope = g_form.getValue('sysparm_transaction_scope');
				ajaxHelper.addParam('sysparm_type', 'loadDefaultList');
				ajaxHelper.addParam('sysparm_tableName', tableName);
				ajaxHelper.addParam('sysparm_transaction_scope', transactionScope);
				ajaxHelper.getXMLAnswer(this.redirectToListLayout.bind(this));
			}
			
