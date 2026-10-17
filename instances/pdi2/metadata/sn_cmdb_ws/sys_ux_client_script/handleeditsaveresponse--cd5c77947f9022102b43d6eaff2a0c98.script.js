function script({ api, event, helpers, imports }) {
	//handleEditSaveResponse script in Map Search Filter UI Controller; fired from broker response to saveEdits
	const { ALERT, addAlerts, cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();

	var functions = {

		handleEditSaveResponse: function () {
			var { info, error } = event.payload?.data?.output;
			if (error?.length) {
				this._setSaveButtonDisabled(false);
				this._displayErrorMessage(error);
			}
			else {
				this._displaySuccessMessage();
				this._resetEditModeData();
			}
			this._logInfoMessage(info);
		},

		_resetEditModeData: function () {
			this._removeNewNodeFlags();
			api.setState('editModeHistory', []);
			api.setState('mapEditsPersisted', true);
			api.setState('originalNodes', cloneDeep(api.state.nodes));
			api.setState('originalEdges', cloneDeep(api.state.edges));
			this._setSaveButtonDisabled(true);
		},

		_removeNewNodeFlags: function () {
			var nodes = cloneDeep(api.state.nodes);
			nodes.map(node => node.isNewMapNode = false);
			api.setState('nodes', nodes);
		},

		_setSaveButtonDisabled: function (isDisabled) {
			var editModeToolbar = cloneDeep(api.state.editModeToolbar);
			editModeToolbar.saveDisabled = isDisabled;
			api.setState('editModeToolbar', editModeToolbar);
		},

		_displaySuccessMessage: function () {
			addAlerts([{
				id: new Date().getTime(),
				status: ALERT.STATUS.POSITIVE,
				icon: ALERT.ICON.INFO_CIRCLE_OUTLINE,
				header: '',
				content: api.state.translations.EDIT_SAVE_SUCCESS,
				action: { type: ALERT.TYPE.DISMISS },
				autoDismiss: true
			}], api, helpers);
		},

		_logInfoMessage: function (infoMessages) {
			infoMessages?.forEach(infoMessage => {
				console.log("Save operation notification: " + infoMessage);
			});
		},

		_displayErrorMessage: function (errors) {
			errors.forEach(errorMessage => {
				addAlerts([{
					id: new Date().getTime(),
					status: ALERT.STATUS.WARNING,
					icon: ALERT.ICON.INFO_CIRCLE_OUTLINE,
					header: api.state.translations.EDIT_SAVE_ERROR,
					content: errorMessage.message,
					action: { type: ALERT.TYPE.DISMISS }
				}], api, helpers);
			});
		}

	};

	functions.handleEditSaveResponse();
}	
