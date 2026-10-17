function script({api, event}) {
	if (api.state.fetchCompletedPayload) {
		api.emit("CTRL_RECORD#RECORD_DATA_FETCH_COMPLETED",  api.state.fetchCompletedPayload);

		// Reset state, so we only dispatch once everytime form reloaded
		api.setState('fetchCompletedPayload',null, false);
		if(api.context.props.skipRelatedListEval === true && api.state.relatedListsStatus !== 'fetched') {
			const newStatus = api.data.glide_form_1?.nowRecordFormBlob?.relatedListMetadata?.hasRelatedLists ? 'available' : 'not-available';
			api.setState('relatedListsStatus', newStatus, true);
		}
	}
}
