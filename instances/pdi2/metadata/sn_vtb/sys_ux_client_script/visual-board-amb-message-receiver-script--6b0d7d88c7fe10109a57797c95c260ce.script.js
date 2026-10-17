async function script({api, event, imports, helpers}) {
	const message = event.payload.message;
	const {deleteItemInArray, cloneDeep, replaceItemInArray, execGraphQLEndPoint, get} = imports['sn_vtb.utils']();
	const {fetchArchiveCards, reorderLanes, deleteLaneAndArchiveItsCards} = imports['sn_vtb.laneHandlers']();
	const {reOrderCards} = imports['sn_vtb.cardManagerMethods']();
	const {setBoardState} = imports['sn_vtb.stateUpdates']();
	const {showAlertAndInitiateDismiss} = imports['sn_vtb.notificationHandler']();
	const {ICONS, BOARD} = imports['sn_vtb.constants']();
	if (!message.data) return;

	const {boardState} = api.state;

	function without(cards, card) {
		return cards.filter((cd) => cd.sys_id !== card.sys_id);
	}


	function updateCardProps(board, card, updatedRecord, cards) {
		const updatedCard = cloneDeep(card);
		updatedCard.record = updatedRecord;
		const updatedCardsArray = replaceItemInArray(cards, updatedCard);
		return {
			...board,
			cards: updatedCardsArray
		}
	}

	const updateChangedFields = (existing, newModel, changedFields) => {
		existing = existing || {};
		const updatedModel = cloneDeep(existing);
		changedFields.forEach((field) => {
			if (newModel.hasOwnProperty(field)) {
				updatedModel[field] = newModel[field];
			}
		});

		return updatedModel;
	};

	function boardUpdateHandler() {
		return {
			update: (message, boardState) => {
				//Todo: handle show_labels
				return updateChangedFields(boardState, message.data, message.change_fields);
			}
		}
	}

	function laneUpdateHandler() {
		return {
			update: (message, boardState) => {
				const newLane = message.data;
				let existingLane;
				if (newLane.is_swim_lane) {
					existingLane = boardState.swimlanes.find((sl) => sl.sys_id === newLane.sys_id);
				} else {
					existingLane = boardState.lanes.find((lane) => lane.sys_id === newLane.sys_id);
				}
				const updatedLane = updateChangedFields(existingLane, newLane, message.change_fields);

				if (updatedLane.is_swim_lane) {
					const updatedSwimlanes = replaceItemInArray(boardState.swimlanes, updatedLane);
					return {
						...boardState,
						swimlanes: updatedSwimlanes
					};
				} else {
					const updatedLanes = replaceItemInArray(boardState.lanes, updatedLane);
					return {
						...boardState,
						lanes: updatedLanes
					};
				}
			},
			insert: (message, boardState) => {
				const newLane = message.data;
				const swimlane = boardState.swimlanes.find((swimlane) => swimlane.sys_id === newLane.sys_id);
				const lane = boardState.lanes.find((lane) => lane.sys_id === newLane.sys_id);
				if (lane || swimlane) return;

				if (newLane.is_swim_lane) {
					const newswimlanes = [...boardState.swimlanes, newLane];
					return {
						...boardState,
						swimlanes: newswimlanes
					};
				} else {
					const newlanes = [...boardState.lanes, newLane];
					return {
						...boardState,
						lanes: newlanes
					}
				}
			},
			delete_cards: async (message, boardState) => {
				const updatedLane = message.data;
				let existingLane;
				if (updatedLane.is_swim_lane) {
					existingLane = boardState.swimlanes.find((sl) => sl.sys_id === updatedLane.sys_id);
				} else {
					existingLane = boardState.lanes.find((lane) => lane.sys_id === updatedLane.sys_id);
				}

				if (!existingLane) return;

				// As we are maintaing single array for cards then when user clicks on `archive all cards` then
				// we can simply fetch all the archived cards and show it in archive cards panel.
				fetchArchiveCards(boardState, message.data, api.emit);


				// // Showing notification in when cards have been archived from other board .
				// // This use case is not supported in classic VTB but to align with Accessibility
				// // we have to show notification message.
				let notification = '';

				if (existingLane.is_swim_lane) {
					notification = await helpers.translate(`Cards for swimlane ${existingLane.name} have been archived`);
				} else {
					notification = await helpers.translate(`Cards for lane ${existingLane.name} have been archived`);
				}
				showAlertAndInitiateDismiss(api, {content: notification, icon: ICONS.CIRCLE_CHECK_OUTLINE}, helpers);
			},
			delete: (message, boardState) => {
				const laneId = message.data;
				return deleteLaneAndArchiveItsCards(laneId, boardState);
			},
			reorder_lanes: (message, boardState) => {
				return reorderLanes(boardState, {
					laneIdList: message.data
				});

			}
		}
	}

	const anyCardsAssignedToUser = (cards, userId) => {
		return cards.some(
			(card) =>
				card.record.assigned_to.value === userId || card.record.additional_assignee_list.value.indexOf(userId) > -1
		);
	};

	function taskUpdateHandler() {
		return {
			exit: (message, boardState) => {
				const taskId = message.data.sys_id;
				const {cards} = boardState;
				const card = cards.find((card) => card.task_id === taskId);
				const index = cards.indexOf(card);
				if (index > -1) {
					const messagePrefix = get(card, "record.number.display_value", "record");
					const message = `Card "${messagePrefix}" no longer matches board criteria and has been removed from board`;

					showAlertAndInitiateDismiss(api, {content: message}, helpers);

					const updatedCards = deleteItemInArray(cards, card);
					return {
						...boardState,
						cards: updatedCards
					};
				}
			},
			change: (message, boardState) => {
				const taskId = message.data.sys_id;
				const {cards, users} = boardState;
				const card = cards.find((card) => card.task_id === taskId);
				if (!card) return;

				const changedFields = message.change_fields;
				const updatedRecord = updateChangedFields(card.record, message.data, changedFields);

				let usersToFetch = [];
				let usersToRemove = [];

				// Cards array excluding the current card we are updating
				const remainingCards = without(cards, card);

				/**
				 * Primary assignee
				 */
				if (changedFields.includes('assigned_to')) {
					let userId = updatedRecord.assigned_to.value;
					if (userId) {
						// When a user is added
						const newAssignee = users.find((user) => user.sys_id === userId);
						if (!newAssignee) {
							usersToFetch.push(userId);
						}
					} else {
						//Removing a user
						const userToBeRemoved = users.find((user) => user.sys_id === card.record.assigned_to.value);
						if (
							userToBeRemoved &&
							!userToBeRemoved.isMember &&
							!anyCardsAssignedToUser(remainingCards, userToBeRemoved.sys_id)
						) {
							usersToRemove.push(userToBeRemoved.sys_id);
						}
					}
				}

				/**
				 * Additional assignees
				 */
				if (changedFields.includes('additional_assignee_list')) {
					const newAssigneesList = updatedRecord.additional_assignee_list.value;
					let existingAssigneesList = card.record.additional_assignee_list.value;
					// Fixme: additional_assignee_list.value is string if there is only one value
					if (typeof existingAssigneesList === 'string') existingAssigneesList = [existingAssigneesList];

					if (newAssigneesList.length > existingAssigneesList.length) {
						// New users added
						newAssigneesList
							.filter((userId) => !existingAssigneesList.includes(userId))
							.forEach((userId) => {
								if (!users.find((user) => user.sys_id === userId)) {
									usersToFetch.push(userId);
								}
							});
					} else {
						// Additional assignees removed
						existingAssigneesList
							.filter((userId) => !newAssigneesList.includes(userId))
							.forEach((userId) => {
								const userToRemove = users.find((user) => user.sys_id === userId);
								if (
									userToRemove &&
									!userToRemove.isMember &&
									// Search in all cards except the current card we are updating
									!anyCardsAssignedToUser(remainingCards, userToRemove.sys_id)
								) {
									usersToRemove.push(userId);
								}
							});
					}
				}

                             
				if (changedFields.includes('due_date') || message.operation === null){
                                    execGraphQLEndPoint('FETCH_VTB_CARD', { cardId:card.sys_id }, api.emit);
                                }
				let updatedState = updateCardProps(boardState, card, updatedRecord, cards);
				if (usersToFetch.length > 0) {
					execGraphQLEndPoint('FETCH_VTB_USERS', {userIds: usersToFetch.join(',')}, api.emit);
				}

				if (usersToRemove.length > 0) {
					const {users} = updatedState;
					const updatedUsers = without(users, ...users.filter((user) => !user.isMember && usersToRemove.includes(user.sys_id)));
					updatedState = {
						...updatedState,
						users: updatedUsers
					};
				}
                         
                    return updatedState;
			}
		}
	}

	const getMessageForAddedCard = (card, board) => {
		const {lanes, swimlanes} = board;
		const lane = lanes.find((lane) => lane.sys_id === card.lane_id);
		let message = '';
		const messagePrefix = get(card, "record.number.display_value", "The record");
		if (board.swimlanes.length > 0) {
			const swimlane = swimlanes.find((swimlane) => swimlane.sys_id === card.swim_lane_id);

			if (lane && swimlane) {
				message = `"${messagePrefix}" has been added to "${lane.name}" and "${swimlane.name}"`;
			}
		} else if (lane) {
			message = `"${messagePrefix}" has been added to "${lane.name}"`;
		}  else {
			if(lanes.length) {
				message = `"${messagePrefix}" has been added to "${lanes[0].name}"`;
			}
		} 
		return message;
	};

	function cardUpdateHandler() {
		return {
			entry: (message, boardState) => {
				// Fetch the card and update cards array.
				// Here we need to consider two cases.
				//    1. On enter event will occur if someone add card from board or table.
				//    2. On enter event will occur if someone restore card from board.
				//    3. On enter event will occur when someone moved a card to the board that you're currently viewing.
				const cardId = message.data;
				let fields = null;
				if (message.record && message.record.sys_class_name) {
					const recordClassName = message.record.sys_class_name.value;
					if (boardState.recordTypeToEvamTemplate[recordClassName]) {
						fields = boardState.recordTypeToEvamTemplate[recordClassName].fields;
					}
					boardState.recordTypeToEvamTemplate;
				}
				execGraphQLEndPoint('FETCH_VTB_CARD', {cardId, fields}, api.emit);

				if (message.operation === 'update') {
					const existingCard = boardState.cards.find((c) => c.sys_id === cardId);
					if (existingCard && existingCard.removed) {
						const notification = getMessageForAddedCard(existingCard, boardState);
						showAlertAndInitiateDismiss(api, {content: notification}, helpers);
					}
				}
			},
			exit: (message, boardState) => {
				let archivedCard = boardState.cards.find((c) => c.task_id === message.data);
				if (archivedCard) {
					const index = boardState.cards.findIndex((card) => card.sys_id === archivedCard.sys_id);
					if (index === -1) return;
					if(boardState.boardType !== BOARD.FREEFORM) {
						let {cards} = boardState;
						const updatedCards = deleteItemInArray(cards, archivedCard);
						return {
							...boardState,
							cards: updatedCards
						};
					}

					// Fetch the card and update cards array.
					execGraphQLEndPoint('FETCH_ARCHIVE_CARD', {cardId: archivedCard.sys_id}, api.emit);
					// Todo: this is not the correct message here
					const messagePrefix = get(archivedCard, "record.number.display_value", "The record");
					const notification = `"${messagePrefix}" has been archived`;
					showAlertAndInitiateDismiss(api, {content: notification, icon: ICONS.CIRCLE_CHECK_OUTLINE}, helpers);
				}

			},
			change: (message, boardState) => {
				const card = message.data;
				const cardId = card.sys_id;

				let fields = null;
				if (message.record && message.record.sys_class_name) {
					const recordClassName = message.record.sys_class_name.value;
					if (boardState.recordTypeToEvamTemplate[recordClassName]) {
						fields = boardState.recordTypeToEvamTemplate[recordClassName].fields;
					}
				}
				execGraphQLEndPoint('FETCH_VTB_CARD', {cardId, fields}, api.emit);
			},
			removeReorderedCards: (message, boardState) => {
				const cardIdListPayload = {
					cardIdList: message.data
				};
				let map = {};
				boardState.cards.forEach((card) => {
					map[card.id] = card;
				});
				let unchangedCards = [];
				for (let i = 0; i < cardIdListPayload.cardIdList.length; i++) {
					let card = map[cardIdListPayload.cardIdList[i]];
					if (card && card.order === i) {
						unchangedCards.push(card);
					}
				}

				return {
					...boardState,
					cards: unchangedCards
				};
			},
			reorder_cards: (message, boardState) => {
				const cardIdListPayload = {
					cardIdList: message.data
				};
				return reOrderCards(boardState, cardIdListPayload);
			}
		}
	}

	const memberUpdateHandler = () => {
		return {
			entry: (message, boardState) => {
				const {data: newUser} = message;
				const {users} = boardState;

				const existingUser = users.find((user) => user.sys_id === newUser.sys_id);
				let updatedBoardUsers;
				if (existingUser) {
					const updatedUser = cloneDeep(existingUser);
					updatedUser.isMember = true;
					updatedBoardUsers = replaceItemInArray(users, updatedUser);
				} else {
					const updatedUser = cloneDeep(newUser);
					updatedUser.isMember = true;
					updatedBoardUsers = [...users, updatedUser];
				}
				return {
					...boardState,
					users: updatedBoardUsers
				};
			},
			exit: (message, boardState) => {
				const {data: newUser} = message;
				const {users} = boardState;

				const existingUser = users.find((user) => user.sys_id === newUser.sys_id);

				const updatedUser = cloneDeep(existingUser);
				let updatedBoardUsers;
				if (anyCardsAssignedToUser(boardState.cards, newUser.sys_id)) {
					// Make the member as assignee
					updatedUser.isMember = false;
					updatedBoardUsers = replaceItemInArray(users, updatedUser);
				} else {
					// Remove the user
					updatedBoardUsers = deleteItemInArray(users, existingUser);
				}
				return {
					...boardState,
					users: updatedBoardUsers
				};
			}
		}
	}

	const LabelEntryUpdateHandler = (message, boardState) => {
		const {data: newCard, change_fields: changedFields} = message;
		if (!newCard.labels) newCard.labels = [];
		const {cards} = boardState;
		const existingCard = cards.find((card) => card.sys_id === newCard.sys_id);
		const updatedCard = updateChangedFields(existingCard, newCard, changedFields);
		const updatedCards = replaceItemInArray(cards, updatedCard);
		return {
			...boardState,
			cards: updatedCards
		};
	}

	const boardLabelUpdateHandler = (message, boardState) => {
		return {
			...boardState,
			labels: message.data.labels
		}
	}

	const ambHandlers = {
		['vtb.lane']: laneUpdateHandler(),
		['vtb.board']: boardUpdateHandler(),
		['vtb.task']: taskUpdateHandler(),
		['vtb.card']: cardUpdateHandler(),
		['vtb.member']: memberUpdateHandler(),
		['vtb.board_label']: boardLabelUpdateHandler,
		['vtb.label_entry']: LabelEntryUpdateHandler,
	}
	let ambHandler;
	let ambHandlerForType
	if (event.payload.type === 'vtb.board_label' || event.payload.type === 'vtb.label_entry') {
		ambHandler = ambHandlers[event.payload.type];
	} else {
		if (event.payload.type) {
			ambHandlerForType = ambHandlers[event.payload.type];
		}
		if (ambHandlerForType) {
			if (message.operation) {
				ambHandler = ambHandlerForType[message.operation];
			}

			if (!ambHandler && message.action) {
				ambHandler = ambHandlerForType[message.action];
			}
		}
	}
	if (ambHandler) {
		const newState = await ambHandler(message, boardState);
		if (newState) 
			setBoardState(api, newState);
	}
}
