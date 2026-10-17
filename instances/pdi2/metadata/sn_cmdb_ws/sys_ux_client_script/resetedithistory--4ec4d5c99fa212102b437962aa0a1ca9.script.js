function script({ api, event, helpers, imports }) {
	//resetEditHistory script in Map Search Filter UI Controller; handler for SN_UNIFIED_MAP_CTRL#RESET_EDIT_HISTORY event
	const { cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();

	var functions = {

		resetEditHistory: function () {
			if (!event.payload.skipPrompt) {
				//show modal warning the user of unsaved changes
				helpers.modal.open("[component-id$='reset_edit_history']");
			} else { //no changes made so just exit
				var editModeToolbar = cloneDeep(api.state.editModeToolbar);
				editModeToolbar.saveDisabled = true;
				api.setState('editModeToolbar', editModeToolbar);

				api.setState('mapEditsPersisted', false);
				api.setState('editModeHistory', []);

				api.setState('nodes', cloneDeep(api.state.originalNodes));
				api.setState('edges', cloneDeep(api.state.originalEdges));

				this._syncCiData(api.data.getMapDataController.ciData, api.state.originalCiData);
			}
		},

		_syncCiData: function (target, source) {

			var targetKeys = Object.keys(target);
			var sourceKeys = Object.keys(source);

			targetKeys.forEach(function (key) {
				if (!sourceKeys.includes(key)) {
					delete target[key];
				}
			});

			sourceKeys.forEach(function (key) {
				target[key] = cloneDeep(source[key]);
			});

		}
	};
	functions.resetEditHistory();
}
