function script({ api, event, helpers, imports }) {
	//exitEditMode script in Map Search Filter UI Controller; handler for SN_UNIFIED_MAP_CTRL#EXIT_EDIT_MODE event
	const { cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();
	const { setContextMenus, resetEditModeStates } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();
	
	var functions = {

		exitEditMode: function () {
			if (api.state.editModeHistory.length && !event.payload.skipPrompt) {
				//show modal warning the user of unsaved changes
				helpers.modal.open("[component-id$='exit_edit_mode']");
			} else { //no changes made so just exit
				api.emit('SN_UNIFIED_MAP_CTRL#REQUEST_TO_UPDATE_PAGE_PROPS', { params: { editMode: "false" } });
				if (api.state.mapEditsPersisted) {
					api.setState('mapEditsPersisted', false);
					api.setState('editModeHistory', []);
					api.setState('editModeToolbar', { "saveDisabled": true });
					api.emit('SN_UNIFIED_MAP_CTRL#MARKER_TIMESTAMP_CHANGED',
						{
							timestamp: Date.now()
						});
				}
				setContextMenus({ editMode: false }, api);
				resetEditModeStates(api);
				api.setState('disableMinimap', false);
				api.emit('SN_UNIFIED_MAP_CTRL#RELOAD_MAP'); //reload regardless since it wipes the node and edge changes for editMode
				this._setNodemapButtonsForViewMode();
			}
			api.emit('SN_UNIFIED_MAP_CTRL#CHANGE_PANEL_TAB', {
				newTabIndex: '1' // Attributes panel
			});
		},

		_setNodemapButtonsForViewMode: function () {
			api.setState('nodemapButtonItems', api.context.props.nodemapButtonItems);
		}

	};

	functions.exitEditMode();
}
