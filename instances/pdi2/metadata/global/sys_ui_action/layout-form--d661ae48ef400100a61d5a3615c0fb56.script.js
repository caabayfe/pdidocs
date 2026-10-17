			function redirectToFormLayout(answer) {
				if (answer != null && answer != "false")
					personalizer(answer, 'section');
				else
					g_form.addErrorMessage(new GwtMessage().getMessage("Default form section not found"));
			}

			function formLayoutOnClick() {
				var ajaxHelper = new GlideAjax('TableEditorAjaxProcessor');
				var tableName = g_form.getValue('name');
				var transactionScope = g_form.getValue('sysparm_transaction_scope');
				ajaxHelper.addParam('sysparm_type', 'loadDefaultFormSection');
				ajaxHelper.addParam('sysparm_tableName', tableName);
				ajaxHelper.addParam('sysparm_transaction_scope', transactionScope);
				ajaxHelper.getXMLAnswer(this.redirectToFormLayout.bind(this));
			}
			
