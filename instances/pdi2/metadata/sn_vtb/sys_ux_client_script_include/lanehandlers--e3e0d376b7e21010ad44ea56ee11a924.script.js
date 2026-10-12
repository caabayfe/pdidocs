function include({
    imports
}) {
    const {
        'sn_vtb.constants': constantsInclude,
        'sn_vtb.utils': utilsInclude,
        'sn_vtb.moveLane': moveLane
    } = imports;
    const {
        cloneDeep,
        get,
        replaceItemInArray,
        deleteItemInArray,
        execGraphQLEndPoint,
        setFocusableElementOnBoard,
        resetFocusableItemOnBoard
    } = utilsInclude();
    const {
        DATA_BROKER_OP: {
            LANE_MOVE,
            SWIMLANE_MOVE,
            SET_USER_PREFERENCE,
            LANE_HEADER_UPDATED
        }
    } = constantsInclude();

    const moveSwimlaneOptimisticHandler = (boardState, boardFocusState, payload) => {
        const {
            boardState: newBoardState,
            laneIdList
        } = moveSwimlaneHandler(boardState, payload);
        let boardStateWithoutFocus = resetFocusableItemOnBoard(newBoardState, boardFocusState);
        let {swimlanes: updatedSwimlanes} = boardStateWithoutFocus;
        const {id: swimlaneId} = payload;
        let swimlaneWithFocus = updatedSwimlanes.find(sl => sl.sys_id === swimlaneId);
        swimlaneWithFocus.isFocus = true;
        updatedSwimlanes = replaceItemInArray(updatedSwimlanes, swimlaneWithFocus);
        const newBoardStateWithFocussedSwimlane = {
            ...boardStateWithoutFocus,
            swimlanes: updatedSwimlanes
        }
        const newBoardFocusState = {
            operation: 'MOVE_SWIMLANE',
            id: swimlaneWithFocus.sys_id,
            elementType: 'swimlane'
        }

        const dbPayload = moveLaneDbOperationPayload({
            laneIdList,
            isSwimLane: true
        });

        return {
            newBoardState: newBoardStateWithFocussedSwimlane,
            newBoardFocusState,
            dbPayload
        }
    };

    const moveLaneOptimisticHandler = (boardState, boardFocusState, payload) => {
        const {
            boardState: newBoardState,
            laneIdList
        } = moveLaneHandler(boardState, payload);
        let boardStateWithoutFocus = resetFocusableItemOnBoard(newBoardState, boardFocusState);
        let {lanes: updatedLanes} = boardStateWithoutFocus;
        const {id: laneId} = payload;
        let laneWithFocus = updatedLanes.find(l => l.sys_id === laneId);
        laneWithFocus.isFocus = true;
        updatedLanes = replaceItemInArray(updatedLanes, laneWithFocus);
        const newBoardStateWithFocussedLane = {
            ...boardStateWithoutFocus,
            lanes: updatedLanes
        }
        const newBoardFocusState = {
            operation: 'MOVE_LANE',
            id: laneWithFocus.sys_id,
            elementType: 'lane'
        }

        const dbPayload = moveLaneDbOperationPayload({
            laneIdList
        });

        return {
            newBoardState: newBoardStateWithFocussedLane,
            newBoardFocusState,
            dbPayload
        }
    };

    const moveLaneHandler = (boardState, payload) => {
        const {
            id,
            fromPosition,
            toPosition
        } = payload;
        const {
            lanes,
            hidden_lanes: hiddenLanes
        } = boardState;
        const modifiedLanes = moveLane({
            fromPosition,
            id,
            toPosition,
            lanes,
            hiddenLanes
        });
        const laneIdList = modifiedLanes.map(lane => lane.sys_id);
        return {
            laneIdList,
            boardState: {
                ...boardState,
                lanes: modifiedLanes
            }
        }
    };

    const moveSwimlaneHandler = (boardState, payload) => {
        const {
            fromPosition,
            toPosition,
            id
        } = payload;
        const {
            swimlanes: lanes,
            hidden_lanes: hiddenLanes
        } = boardState;

        const modifiedLanes = moveLane({
            fromPosition,
            id,
            toPosition,
            lanes,
            hiddenLanes
        });
        const laneIdList = modifiedLanes.map(lane => lane.sys_id);

        return {
            laneIdList,
            boardState: {
                ...boardState,
                swimlanes: modifiedLanes
            }
        }
    };

    const reorderLanes = (boardState, payload) => {
        const {
            lanes,
            swimlanes = []
        } = boardState;

        let {
            laneIdList: reorderedIds
        } = payload;

        const storeLaneObjs = {};
        lanes.forEach((lane) => (storeLaneObjs[lane.sys_id] = lane));
        let reorderedLanes,
            reorderedSwimlanes,
            slReorderedIds = [];

        // Reordered lane id's may contain lanes that do not yet exist in the board, filter them out
        const lReorderedIds = reorderedIds.filter((id) => storeLaneObjs[id]);
        if (lReorderedIds.length > 0) {
            reorderedLanes = lReorderedIds.map((laneId, index) => {
                const lane = cloneDeep(storeLaneObjs[laneId]);
                lane.order = reorderedIds.indexOf(laneId);
                return lane;
            });
        }

        // 1.message.data is either a list of lane ids or swimlane ids for lane move
        // 2.message.data is both lane and swimlane ids (as order in vtb_lane.list) for
        // lane add and lane delete
        // TODO: Try if we can get lanetype from AMB response.
        if (swimlanes.length > 0) {
            const storeSlaneObjs = {};
            swimlanes.forEach((lane) => (storeSlaneObjs[lane.sys_id] = lane));
            slReorderedIds = reorderedIds.filter((id) => storeSlaneObjs[id]);
            if (slReorderedIds.length > 0) {
                reorderedSwimlanes = slReorderedIds.map((laneId, index) => {
                    const sLane = cloneDeep(storeSlaneObjs[laneId]);
                    sLane.order = reorderedIds.indexOf(laneId);
                    return sLane;
                });
            }
        }
        return {
            ...boardState,
            lanes: lReorderedIds.length > 0 ? reorderedLanes : lanes,
            swimlanes: slReorderedIds.length > 0 ? reorderedSwimlanes : swimlanes
        }
    };

    const moveLaneDbOperationPayload = (payload) => {
        const {
            laneIdList,
            isSwimLane
        } = payload;

        return {
            operationName: isSwimLane ? SWIMLANE_MOVE : LANE_MOVE,
            operationPayload: {
                laneIdList
            }
        }
    };

    const fetchArchiveCards = (boardState, payload, emit) => {
        console.log('fetch archive cards');
        execGraphQLEndPoint('FETCH_ARCHIVE_CARDS', {
            boardId: boardState.sys_id
        }, emit);
    }
    const archiveCardsByLaneSuccessHandler = (boardState, payload, emit) => {
        const updatedLane = payload.data.output.data.GlideVisualBoard_Mutation.archiveAllCardsByLane;

        const {
            sys_id,
            lanes,
            swimlanes
        } = boardState;
        if (updatedLane) {

            let existingLane;
            if (updatedLane.is_swim_lane) {
                existingLane = swimlanes.find((sl) => sl.sys_id === updatedLane.sys_id);
            } else {
                existingLane = lanes.find((lane) => lane.sys_id === updatedLane.sys_id);
            }
            if (!existingLane) return;
            fetchArchiveCards(boardState, payload, emit);

        }
    };

    const createLaneRequestSuccessHandler = (boardState, boardFocusState, payload) => {
        const updatedLane = payload.data.output.data.GlideVisualBoard_Mutation.createLane;

        if (updatedLane) {

            if (boardState.boardType !== 'GUIDED') {
                updatedLane.editing = true;
            }
            if (updatedLane.is_swim_lane) {
                const lanes = [...boardState.swimlanes, updatedLane];
                const boardStateWithNewSwimlane = {
                    ...boardState,
                    swimlanes: lanes
                }
                //const updatedBoard = setFocusableElementOnBoard('CREATE_LANE_REQUEST', boardFocusState, null, boardStateWithNewSwimlane);
                const updatedBoardState = resetFocusableItemOnBoard(boardStateWithNewSwimlane , boardFocusState);
                const updatedBoardFocusState = {
                    operation: 'CREATE_LANE_REQUEST',
                    id: 'addNewSwimlane_sysId',
                    elementType: 'swimlane'
                }

                return {
                    newBoardDirtyState: updatedBoardState,
                    newBoardFocusState: updatedBoardFocusState,
                }

            } else {
                const lanes = [...boardState.lanes, updatedLane];
                const boardStateWithNewLane = {
                   ...boardState,
                   lanes
                }
                const boardStateWithoutFocus = resetFocusableItemOnBoard(boardStateWithNewLane , boardFocusState);
                return {
                     newBoardDirtyState : boardStateWithoutFocus
                }
            }
        }
    };

    const setUserPreferenceSuccessHandler = (board, payload) => {
        const pref = payload.data.output.data.now.userPreference.updateUserPreference;

        if (pref) {
            const {
                name,
                value
            } = pref;
            if (name === 'vtb.board.' + board.sys_id + '.hiddenLanes') {
                const updatedHiddenLanes = value.split('-');
                return {
                    ...board,
                    hidden_lanes: updatedHiddenLanes
                };
            }
        }
    };

    const updateLaneHeaderSuccessHandler = (board, payload) => {
        const updatedLane = payload.data.output.data.GlideVisualBoard_Mutation.updateLane;

        const {
            lanes,
            swimlanes
        } = board;
        const {
            sys_id: laneId,
            name: name
        } = updatedLane;
        let changedLane, existingLane;

        if (updatedLane.is_swim_lane) {
            existingLane = swimlanes.find((sl) => sl.sys_id === laneId);
        } else {
            existingLane = lanes.find((l) => l.sys_id === laneId);
        }
        changedLane = cloneDeep(existingLane);
        changedLane.name = name;
        changedLane.editing = false;
        changedLane.title = name;

        if (changedLane.is_swim_lane) {
            const updatedSwimlanes = replaceItemInArray(swimlanes, changedLane);
            return {
                ...board,
                swimlanes: updatedSwimlanes
            };
        } else {
            const updatedLanes = replaceItemInArray(lanes, changedLane);
            return {
                ...board,
                lanes: updatedLanes
            };
        }
    };

	const archiveCard = (card, laneId) => {
		if (card.lane_id === laneId || card.swim_lane_id === laneId) {
			const clonedCard = cloneDeep(card);
			clonedCard.removed = true;
			return clonedCard;
		}
		return card;
	}

	const archiveCardsByLaneId = (laneId, board) => {
		return board.cards.map((card) => archiveCard(card, laneId))
	}

    const deleteLaneAndArchiveItsCards = (laneId, board) => {
	if (laneId) {
		const {
			lanes,
			swimlanes
			} = board;
			const swimlane = swimlanes.find((swimlane) => swimlane.sys_id === laneId);
			if (swimlane) {
				const updatedSwimlanes = deleteItemInArray(swimlanes, swimlane);
				return {
					...board,
					cards: archiveCardsByLaneId(laneId, board),
					swimlanes: updatedSwimlanes
				};
			} else {
				const lane = lanes.find((lane) => lane.sys_id === laneId);
				if (lane) {
					const updatedLanes = deleteItemInArray(lanes, lane);
					return {
						...board,
						cards: archiveCardsByLaneId(laneId, board),
						lanes: updatedLanes
				}
				}
			}
		}
	};

	const deleteLaneHeaderSuccessHandler = (boardState, boardFocusState, payload)  => {
		const laneId = payload.data.output.data.GlideVisualBoard_Mutation.deleteLane;
		const {
			lanes,
			swimlanes
		} = boardState;
		let laneType;
		let deletedLane;
		deletedLane = lanes.find((lane) => lane.sys_id === laneId);
		if(deletedLane) {
            laneType = "lane";
        }else {
            deletedLane = swimlanes.find((sl) => sl.sys_id === laneId);
            laneType = "swimlane";
        }
		const updatedBoard = setFocusableElementOnBoard({
            operation: 'DELETE_LANE',
            boardFocusState,
            boardState,
            element: deletedLane,
            elementType: laneType
		});
		const boardStateAfterDelete = deleteLaneAndArchiveItsCards(laneId, updatedBoard.boardState);
		 return {
            newBoardDirtyState: boardStateAfterDelete,
            newBoardFocusState: updatedBoard.boardFocusState
         }
	};

    const fetchVTBUsersSuccessHandler = function(board, payload) {
        const assignees = payload.data.output.data.GlideVisualBoard_Query.getUsers;
        const newUsers = assignees.map((user) => ({
            ...user,
            isMember: false
        }));
        return {
            ...board,
            users: [...board.users, ...newUsers]
        }
    };

    const swimlaneActionHandler = (boardState, payload) => {
        const {
            type
        } = payload;
        const swimlanes = cloneDeep(boardState.swimlanes);

        switch (type) {
            case 'VTB#COLLAPSE_ALL_SWIMLANES':
                swimlanes.forEach((lane) => (lane.collapsed = true));
                break;
            case 'VTB#EXPAND_ALL_SWIMLANES':
                swimlanes.forEach((lane) => (lane.collapsed = false));
                break;
            case 'VTB#TOGGLE_SWIMLANE_BODY':
                const {
                    payload: {
                        id,
                        collapsed
                    }
                } = payload;
                const swimlane = swimlanes.find((sl) => sl.sys_id === id);
                if (!swimlane) return;
                swimlane.collapsed = collapsed;
                break;
        }

        return {
            ...boardState,
            swimlanes
        };
    };

    const hideLaneOptimisticHandler = (boardState, boardFocusState, payload) => {
        const {
            laneId
        } = payload;
        if (!laneId) return;
        let returnVal = {};

        const {
            hidden_lanes,
            sys_id: boardId,
            swimlanes,
            lanes
        } = boardState;
        let laneType;
        let hiddenLane = lanes.find(l => l.sys_id === laneId);
        if(hiddenLane)
            laneType = "lane";
        else {
            hiddenLane = swimlanes.find(sl => sl.sys_id === laneId);
            laneType = "swimlane";
        }
        if(hiddenLane) {
            const updatedBoard = setFocusableElementOnBoard({operation: 'HIDE_LANE',
             boardFocusState,
             boardState,
             element: hiddenLane,
             elementType: laneType
             });
            returnVal.newBoardState = updatedBoard.boardState;
            returnVal.newBoardFocusState = updatedBoard.boardFocusState;
        }
        const updatedHiddenLanes = [...hidden_lanes, laneId];
        returnVal.dbPayload = {
            operationName: SET_USER_PREFERENCE,
            operationPayload: {
                name: 'vtb.board.' + boardId + '.hiddenLanes',
                value: updatedHiddenLanes.join('-')
            }
        }

        return returnVal;
    };

    const getQuery = (lane) => {
        if (!lane) return '';
        const {
            table,
            lane_field,
            swimlane_field
        } = lane.options;
        const field = lane.is_swim_lane ? swimlane_field : lane_field;
        if (field === '__KANBAN__') return '';
        if (lane.is_choice_lane) {
            const value = getChoiceValue(lane.value, table);
            return `${field}=${value}`;
        }
        return `${field}=${lane.value}`;
    };

    const getChoiceValue = (value, table) => {
        return value
            .split(',')
            .find((item) => item.indexOf(table > -1))
            .split(':')[1];
    };

  const laneHeaderOptimisticUpdateHandler = (boardState, boardDirtyState, payload) => {
    const { laneId, name: newName } = payload;
    const { lanes, swimlanes } = boardState;
    let isSwimlane = false;
    let currentLane = lanes.find((lane) => lane.sys_id === laneId);
    if(!currentLane){
        isSwimlane = true;
        currentLane = swimlanes.find((slane) => slane.sys_id === laneId);
    }

    const dirtyState = {
      ...boardDirtyState,
      [LANE_HEADER_UPDATED]: {
        ...payload,
        name: currentLane.name,
      },
    };

    const changedLane = {
      ...currentLane,
      name: newName,
    };

    const updatedLanes =
        isSwimlane ? replaceItemInArray(swimlanes, changedLane) : replaceItemInArray(lanes, changedLane);

    const newBoardState = {
        ...boardState,
        lanes: isSwimlane ? lanes : updatedLanes,
        swimlanes: isSwimlane ? updatedLanes : swimlanes
    };

    const dbPayload = {
      operationName: LANE_HEADER_UPDATED,
      operationPayload: {
        laneId: laneId,
        name: newName,
      },
    };

    return {
      newBoardState: newBoardState,
      dbPayload: dbPayload,
      boardDirtyState: dirtyState,
    };
  };

  const laneHeaderUpdateFailureHandler = (boardState, payload) => {
      const {laneId, name} = payload;
      const { lanes, swimlanes } = boardState;
      let isSwimlane = false;
      let currentLane = lanes.find((lane) => lane.sys_id === laneId);
      if(!currentLane){
          isSwimlane = true;
          currentLane = swimlanes.find((slane) => slane.sys_id === laneId);
      }
      const changedLane = { ...currentLane, name: name};
      const updatedLanes =
          isSwimlane ? replaceItemInArray(swimlanes, changedLane) : replaceItemInArray(lanes, changedLane);

      return {
          ...boardState,
          lanes: isSwimlane ? lanes : updatedLanes,
          swimlanes: isSwimlane ? updatedLanes : swimlanes
      }
  }

    return {
	    deleteLaneAndArchiveItsCards,
        moveLaneOptimisticHandler,
        moveSwimlaneOptimisticHandler,
        reorderLanes,
        archiveCardsByLaneSuccessHandler,
        createLaneRequestSuccessHandler,
        setUserPreferenceSuccessHandler,
        updateLaneHeaderSuccessHandler,
        deleteLaneHeaderSuccessHandler,
        fetchArchiveCards,
        fetchVTBUsersSuccessHandler,
        swimlaneActionHandler,
        hideLaneOptimisticHandler,
        laneHeaderOptimisticUpdateHandler,
        laneHeaderUpdateFailureHandler,
        getQuery
    };
}
