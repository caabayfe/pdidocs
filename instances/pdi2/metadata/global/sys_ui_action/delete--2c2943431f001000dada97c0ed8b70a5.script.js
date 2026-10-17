function showConfirmDialog() {
			var entries = g_list.getChecked();
			if (!entries || entries.length == 0)
				return;

			var callback = function() {
				var ga = new GlideAjax('DeleteUpdateSetEntryAjax');
				ga.addParam('sysparm_name', 'deleteEntries');
				ga.addParam('sysparm_entry_ids', entries);

				var afterDelete = function() {
					g_navigation.reloadWindow(window);
				};

				ga.getXMLAnswer(afterDelete.bind(this));
				return true;
			};

			var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
			var dialog = new dialogClass('glide_confirm_standard');
			dialog.setTitle(new GwtMessage().getMessage('Confirmation'));
			dialog.setPreference('warning', true);
			dialog.setPreference('title', new GwtMessage().getMessage("delete_update_set_entries"));
			dialog.setPreference('onPromptComplete', callback.bind(this));
			dialog.render();
		}
			
