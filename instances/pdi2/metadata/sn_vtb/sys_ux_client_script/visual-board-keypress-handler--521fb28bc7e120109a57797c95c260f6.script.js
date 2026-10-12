function script({api, event, imports, helpers}) {

	
	if (event.payload && event.payload.event && event.payload.event.type === 'keydown') {
           console.log("keypressed");
		const {
			'sn_vtb.cardHandlers': cardHandlersInclude,
			'sn_vtb.cardManagerMethods': cardManagerMethodsInclude,
            'sn_vtb.utils':utilsInclude
		} = imports;
		const {
			addPlaceHolderCardhandler
		} = cardHandlersInclude();

	const {
			resetFocusableItemOnBoard
		} = utilsInclude();

		const {
			constructVtbCardFormData
		} = cardManagerMethodsInclude();
		
		const {ACCESSIBILITY} = imports['sn_vtb.constants']();
		const {closestDeep, querySelectorDeep} = imports['sn_vtb.VisualBoardAccessibilityUtils']();
		const {setBoardState, setBoardDirtyState} = imports['sn_vtb.stateUpdates']();
		const {
			LANE_HEADER_SELECTOR, LANE_HEADER_FIRST_ELEM_SELECTOR, ADD_CARD_SELECTOR, NOW_CARD_SELECTOR, CARD_FIRST_ELEM_SELECTOR
			, VTB_CARD_SELECTOR, SWIMLANE_HEADER_FIRST_ELEM_SELECTOR, SWIMLANE_HEADER_SELECTOR
		} = ACCESSIBILITY;
		const {
			boardState,
			boardDirtyState = {},
			boardFocusState = {}
		} = api.state;

		const subComponentsArrowNavigationDescriptor = {
			'sn-lane-header': {
				elementSelector: LANE_HEADER_SELECTOR,
				elementFirstChildSelector: LANE_HEADER_FIRST_ELEM_SELECTOR
			},
			'lane-footer-container': {
				elementSelector: ADD_CARD_SELECTOR,
				['Enter']: (activeElement) => {
					//Click Add card button
					if (activeElement && activeElement.matches(ADD_CARD_SELECTOR)) {
						let resullt;
						const snLane = closestDeep(activeElement, 'sn-lane');
						let updateState;
						const newCard = {
							position: 'bottom'
						};
						//Get laneId and swimlaneId of add-card button from dom
						//if swimlanes are enabled
						if (snLane.getAttribute('id').split('_')[0] !== 'lane') {
							newCard.swim_lane_id = snLane.getAttribute('id').split('_')[0];
							newCard.lane_id = snLane.getAttribute('id').split('_')[1];
						} else {
							newCard.lane_id = snLane.getAttribute('id').split('_')[1];
						}
						if (boardState.boardType === 'FREEFORM') {
							resullt = {};
							let newStateWithoutFocusedElement = resetFocusableItemOnBoard(boardState, boardFocusState);
							resullt.newBoardState = addPlaceHolderCardhandler(newStateWithoutFocusedElement, {card:newCard});
							resullt.newBoardDirtyState = boardState;
						}

						else {
							// For guided board we have to construct form for vtb card.
							const newCardFormData = constructVtbCardFormData(boardState, {card : newCard}, true);
							api.setState('cardForm', newCardFormData);
						}
						return resullt;
					}
				}
			},
			'sn-card-wrapper': {
				elementSelector: NOW_CARD_SELECTOR,
				elementFirstChildSelector: CARD_FIRST_ELEM_SELECTOR,
				closeDeepEle: (activeElement) => {
					let rootElement =  closestDeep(activeElement, VTB_CARD_SELECTOR);
					return querySelectorDeep(NOW_CARD_SELECTOR, rootElement);
				},
				getRootEle: (activeElement) => {
					return closestDeep(activeElement, VTB_CARD_SELECTOR);
				}
			},
			'sn-swimlane-header': {
				elementSelector: SWIMLANE_HEADER_SELECTOR,
				elementFirstChildSelector: SWIMLANE_HEADER_FIRST_ELEM_SELECTOR

			}
		};
		const onFocusLost = () => {
		};
		const {boardAccessibilityHandler} = imports['sn_vtb.VisualBoardAccessibilityHandler']();
		const result = boardAccessibilityHandler(event, subComponentsArrowNavigationDescriptor, onFocusLost);

		if (result && result.newBoardState) {
			setBoardState(api, result.newBoardState, helpers);
		}

		 if (result && result.newBoardDirtyState) {
			setBoardDirtyState(api, result.newBoardDirtyState);
		}

		if (newBoardState) 
			setBoardState(api, out.newBoardState);
	}

}
