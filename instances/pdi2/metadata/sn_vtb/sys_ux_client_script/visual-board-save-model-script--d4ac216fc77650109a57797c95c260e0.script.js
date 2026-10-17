function script({api, event, helpers, imports}) {
	const utils = imports['sn_vtb.utils']();
	const {execGraphQLEndPoint} = utils;
	const modalData = api.state.modalData;
	const modalSaveHandlers = {
		archiveCard: () => {
			const {cardId} = modalData;
			const archiveCardInput = {
				cardId
			};
			console.log(archiveCardInput);
			execGraphQLEndPoint('CARD_ARCHIVED', archiveCardInput, api.emit);
		},
		deleteLane: () => {
			console.log('deleteLane');
			console.log('archiveAllCards');
			const {laneId, boardId} = modalData;
			const deleteLaneInput = {
				laneId,
				boardId
			};
			console.log(deleteLaneInput);
			console.log(modalData);
			execGraphQLEndPoint('DELETE_LANE', deleteLaneInput, api.emit);
		},
		archiveAllCards: () => {
			console.log('archiveAllCards');
			const {laneId} = modalData;
			const archiveAllCardsByLaneInput = {
				laneId
			};
			execGraphQLEndPoint('ARCHIVE_ALL_CARDS_BY_LANE', archiveAllCardsByLaneInput, api.emit);
		},

		recordForm: () => {
			console.log('recordForm');
		},

		cardDetails: () => {
			console.log('cardDetails');
		}

	}
	let modalId = api.state.modalId;
	if (modalId) {
		let modalSaveHandler = modalSaveHandlers[modalId];
		if (modalSaveHandler) {
			modalSaveHandler();
		}
	}
}
