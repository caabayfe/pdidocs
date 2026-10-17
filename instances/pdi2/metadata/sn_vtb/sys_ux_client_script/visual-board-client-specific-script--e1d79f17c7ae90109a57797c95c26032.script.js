function script({api, event, state, imports, helpers}) {
	console.log("script called");
	const {
		'sn_vtb.constants': constantsInclude,
		'sn_vtb.cardHandlers': cardHandlersInclude,
		'sn_vtb.laneHandlers': laneHandlersInclude,
		'sn_vtb.stateUpdates': stateUpdatesInclude,
		'sn_vtb.cardManagerMethods': cardManagerMethodsInclude,
		'sn_vtb.utils': utilsInclude
	} = imports;
	const {
		snHttp
	} = helpers;
	const {
		execGraphQLEndPoint,
		resetFocusableItemOnBoard
	} = utilsInclude();
	const {
		ACTIONS: {
			VTB_CREATE_LANE_ACTION_PERFORMED,
			VTB_SWIMLANE_ACTION,
			VTB_ADD_CARD_CLICKED,
			VTB_FREEFORM_CARD_ADDED,
			VTB_REMOVE_FREEFORM_PLACEHOLDER_CARD,
			VTB_ATTACHMENT_UPLOADED,
			CARD_MOVED,
			LANE_MOVED,
			SWIMLANE_MOVED,
			VTB_DATA_DRIVEN_CARD_ADDED,
			VTB_LANE_HIDE_SELECTED,
			VTB_LANE_HEADER_UPDATED,
			VTB_LANE_HOVERED,
			VTB_CONFIRMATION_MODAL_SELECTED
		}
	} = constantsInclude();
	const {
		setBoardState,
		setBoardFocusState,
		setBoardDirtyState
	} = stateUpdatesInclude();

	const {
		addPlaceHolderCardhandler,
		removePlaceHolderCardHandler,
		uploadAttachmentHandler,
		moveCardOptimisticHandler,
		addDataDrivenOptimisticCardHandler
	} = cardHandlersInclude();
	const {
		swimlaneActionHandler,
		moveLaneOptimisticHandler,
		moveSwimlaneOptimisticHandler,
		hideLaneOptimisticHandler,
		laneHeaderOptimisticUpdateHandler,
		laneHoverHandler
	} = laneHandlersInclude();

	const {
		constructVtbCardFormData
	} = cardManagerMethodsInclude();
	let name = event.name, payload = event.payload;
	if (event.payload.actionName) {
		name = event.payload.actionName;
		payload = event.payload.payload;
	}

	const {
		emit: dispatch,
	} = api;
	const {
		boardState,
		boardDirtyState = {},
		boardFocusState = {},
	} = api.state;


	let output = {};
	switch (name) {
		case VTB_SWIMLANE_ACTION:
			output.newBoardState = swimlaneActionHandler(boardState, payload);
			break;

		case VTB_ADD_CARD_CLICKED:
			if (boardState.boardType === 'FREEFORM') {
				let newStateWithoutFocusedElement = resetFocusableItemOnBoard(boardState, boardFocusState);
				output.newBoardState = addPlaceHolderCardhandler(newStateWithoutFocusedElement, payload);
				output.newBoardDirtyState = boardState;
			  }

			else {
				// For guided board we have to construct form for vtb card.
				const newCardFormData = constructVtbCardFormData(boardState, payload, true);
				api.setState('cardForm', newCardFormData);
			}
			break;

		case VTB_CONFIRMATION_MODAL_SELECTED :
			const {modalId, modalData} = payload;
			api.setState('modalId', modalId);
			if (modalId === 'cardDetails') {
				api.setState('cardDetails', {
					...modalData,
					table: modalData.record.sys_class_name,
					recordId: modalData.record.sys_id,
					view: "workspace",
					isVisible: true
				});
			} else {
				api.setState('modalData', {
					...modalData,
					headerLabel: modalData.modalData.headerLabel,
					primaryButtonLabel: modalData.modalData.footerActions[0].label,
					secondaryButtonLabel: modalData.modalData.footerActions[1].label,
					content: modalData.modalData.content
				});
				helpers.modal.open("[component-id$='vtbConfirmationModal']");
			}
			break;

		case VTB_REMOVE_FREEFORM_PLACEHOLDER_CARD:
			output.newBoardState = removePlaceHolderCardHandler(boardState, payload);
			break;
		case VTB_ATTACHMENT_UPLOADED:
			uploadAttachmentHandler(api, snHttp, payload, helpers);
			break;
		case VTB_FREEFORM_CARD_ADDED:
			execGraphQLEndPoint('ADD_CARD', payload.createCardInput, api.emit);
			break;
		case VTB_CREATE_LANE_ACTION_PERFORMED :
			if(payload && payload.createLaneInput)
				execGraphQLEndPoint('CREATE_LANE_REQUEST', payload.createLaneInput, api.emit);
			break;
		case CARD_MOVED:
			output = moveCardOptimisticHandler(boardState, boardDirtyState, payload);
			break;

		case LANE_MOVED:
			output = moveLaneOptimisticHandler(boardState, boardFocusState, payload);
			break;

		case SWIMLANE_MOVED:
			output = moveSwimlaneOptimisticHandler(boardState, boardFocusState, payload);
			break;

		case VTB_LANE_HIDE_SELECTED:
			output = hideLaneOptimisticHandler(boardState, boardFocusState, payload);
			break;

		case VTB_LANE_HEADER_UPDATED:
			if(payload && payload.updateLaneInput)
				output = laneHeaderOptimisticUpdateHandler(boardState, boardDirtyState, payload.updateLaneInput);
			break;

		case VTB_LANE_HOVERED:
			output = laneHoverHandler(boardState, payload);
			break;
	}

	if (output.newBoardState)
		setBoardState(api, output.newBoardState, output.newBoardFocusState);

    if(output.newBoardFocusState)
        setBoardFocusState(api, output.newBoardFocusState);

	if (output.newBoardDirtyState)
		setBoardDirtyState(api, output.newBoardDirtyState);

	if (output.dbPayload)
		execGraphQLEndPoint(output.dbPayload.operationName, output.dbPayload.operationPayload, dispatch);
}
