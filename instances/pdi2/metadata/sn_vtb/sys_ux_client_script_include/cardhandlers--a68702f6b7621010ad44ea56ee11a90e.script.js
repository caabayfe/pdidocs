function include({imports}) {
    const {
        'sn_vtb.constants': constantsInclude,
        'sn_vtb.utils': utilsInclude,
        'sn_vtb.cardManagerMethods': cardManagerMethodsInclude,
        'sn_vtb.stateUpdates': stateUpdatesInclude,
        'sn_vtb.notificationHandler': notificationHandlerInclude
    } = imports;
    const {
        DATA_BROKER_OP: {
            CARD_MOVE,
            ADD_CARD,
            CARD_ARCHIVED
        },
        ELEMENTS_IDS: {
            MUTATION_DATA_BROKER_ELEMENT_ID
        },
        DATA_BROKERS_IDS: {
            MUTATION_DATA_BROKER_ID
        },
        ICONS: {
            CIRCLE_CHECK_OUTLINE,
            CIRCLE_CLOSE_OUTLINE
        },
        STATUS: {
            CRITICAL
        },
        ATTACHMENT_UPLOAD_SUCCESS_MESSAGE,
        ATTACHMENT_UPLOAD_FAILURE_MESSAGE
    } = constantsInclude();
    const {
        get,
        cloneDeep,
        replaceItemInArray,
        setFocusableElementOnBoard
    } = utilsInclude();
    const {
        moveCard,
        transformCardData,
        addCardProperties,
        constructVtbCardFormData
    } = cardManagerMethodsInclude();
    const {showAlertAndInitiateDismiss} = notificationHandlerInclude();

    const moveCardOptimisticHandler = (boardState, boardDirtyState, payload) => {
        return {
            newBoardState: moveCardHandler(boardState, payload).newBoardState,
            newBoardDirtyState: moveCardDirtyState(boardDirtyState, payload),
            dbPayload: moveCardDbOperationPayload(boardState, payload)
        }
    };

    const moveCardFailureHandler = (boardState, payload) => {
        const {
            id,
            fromLane: toLane,
            fromSwimlane: toSwimlane,
            fromPosition: toPosition
        } = payload;
        return moveCardHandler(boardState, {
            id,
            toLane,
            toSwimlane,
            toPosition
        });
    };

    const moveCardHandler = (boardState, payload) => {
        const {
            id: cardId,
            toLane,
            toPosition,
            toSwimlane
        } = payload;

        // Optimistic update
        const allCards = cloneDeep(boardState.cards);
        moveCard({allCards, cardId, toLane, toSwimlane, toPosition});

      // For guided board we have to construct the form for vtb card.         
          payload.card = boardState.cards.find((card) =>card.sys_id ===cardId);
          let cardFormData = constructVtbCardFormData(boardState, payload, false);
         const newBoardState = { ...boardState, cards: allCards };
        return {
           newBoardState,
            cardFormData
        }
    };

    const moveCardDirtyState = (boardDirtyState, payload) => {
        return {
            ...boardDirtyState,
            [CARD_MOVE]: {
                ...payload
            }
        }
    };

    const moveCardDbOperationPayload = (boardState, payload) => {
        const {
            id: cardId,
            toLane,
            toPosition,
            toSwimlane
        } = payload;

        let fields = null;
        const card = boardState.cards.find(card => card.sys_id === cardId);
        const recordClassName = card.record.sys_class_name;
        if (recordClassName && 
                boardState.recordTypeToEvamTemplate[recordClassName]) {
            fields = boardState.recordTypeToEvamTemplate[recordClassName].fields;
        }

        return {
            operationName: CARD_MOVE,
            operationPayload: {
                cardId: cardId,
                laneId: toLane,
                order: toPosition,
                swimlaneId: toSwimlane,
                fields
            }
        }
    };

    const moveCardSuccessHandler = (boardState, payload, operationFailPayload) => {
        const {
            data: {
                output: {
                    data: {
                        GlideVisualBoard_Mutation: {
                            updateCard
                        }
                    }
                }
            }
        } = payload;

        let newCard = transformCardData(updateCard);
        addCardProperties(newCard, boardState);
        const updatedCards = replaceItemInArray(boardState.cards, newCard);

        const {
            toLane,
            toSwimlane
        } = operationFailPayload;

        const {
            lane_id,
            swim_lane_id
        } = newCard;

        let warningPayload = null;
        if (toLane !== lane_id || (toSwimlane !== "" && toSwimlane !== swim_lane_id)){
            const messagePrefix = get(newCard, "record.number.display_value", "The record");
            warningPayload = {
                content: `${messagePrefix} was modified before update,the new lane may not reflect your changes.`
            }
        }

        return {
            newBoardState: {
                ...boardState,
                cards: updatedCards
            },
            warningPayload
        }
    };
    const archiveCardSuccessHandler = (boardState, boardFocusState, payload) => {
        const archiveCardId = payload.data.output.data.GlideVisualBoard_Mutation.archiveCard;
    
        const {
            cards
        } = boardState;

        const index = cards.findIndex((card) => card.sys_id === archiveCardId);
        if (index === -1) return;

        const operation = {};
        operation.dataBrokerId = "f547801a0f121010461d37a98b767e8d";
        operation.parentResourceId = "visualBoardMutationCompositeDataBroker";
        operation.dataElementId = operation.parentResourceId;

        const newPayload = {};
        newPayload.operation = operation;
        operation.operationName = "FETCH_ARCHIVE_CARD";
        newPayload.operationPayload = {
            cardId: archiveCardId
        };
   
        const archiveCard = cards.find((card) => card.sys_id === archiveCardId);
        const updatedBoard = setFocusableElementOnBoard({
            operation : CARD_ARCHIVED,
            boardFocusState,
            element: archiveCard,
            boardState,
            elementType: "card"
        });
        console.log("board focus state", updatedBoard.boardFocusState);
        console.log("board state", updatedBoard.boardState);
        return {
            newBoardDirtyState: updatedBoard.boardState,
            newBoardFocusState: updatedBoard.boardFocusState,
        dbPayload: newPayload
        };
};
    const fetchArchiveCardSuccessHandler = (boardState, payload, emit) => {
        const card = payload.data.output.data.GlideVisualBoard_Query.getCard;

        if (!card) return;
        const {
            cards
        } = boardState;

        // Card data need to be transformed after getting response from graphql.
        let transformCard = transformCardData(card);
        addCardProperties(transformCard, boardState);

        let updatedCards = [...cards];

        updatedCards = replaceItemInArray(updatedCards, transformCard);
        return {
            ...boardState,
            cards: updatedCards
        };
    };

    const fetchArchiveCardsSuccessHandler = (board, payload) => {
        const cards = payload.data.output.data.GlideVisualBoard_Query.getArchivedCards;
        // We need to transform card data obtained from graphQl response.
        let archivedCards = cards.map((card) => {
            let transformCard = transformCardData(card);
            addCardProperties(transformCard, board);
            return transformCard;
        });

        // As we are maintaing single array for cards and archived cards , it is possible that archived card
        // from response may contains card with removed= true in cards array.
        // Check if card is there in cards array.
        let updatedCards = cloneDeep(board.cards);
        archivedCards.forEach((card) => {
            const index = updatedCards.findIndex((c) => c.sys_id === card.sys_id);
            if (index === -1) updatedCards.push(card);

            if (index !== -1 && updatedCards[index].removed !== card.removed)
                updatedCards[index].removed = card.removed;
        });

        return {
            ...board,
            cards: updatedCards
        };
    };

    const restoreCardSuccessHandler = (board, payload) => {
        const restoreCard = payload.data.output.data.GlideVisualBoard_Mutation.restoreCard;
        const {
            cards
        } = board;
        const index = cards.findIndex((card) => card.sys_id === restoreCard.sys_id);
        if (index === -1) return;
        let transformRestoreCard = transformCardData(restoreCard);
        addCardProperties(transformRestoreCard, board);

        // replace the restore card with older card in cards array on board.
        let updatedCards = [...cards];
        updatedCards = replaceItemInArray(updatedCards, transformRestoreCard);
        return {
            ...board,
            cards: updatedCards
        };
    };

    const fetchVTBCardSuccessHandler = function(board, payload) {
        const card = payload.data.output.data.GlideVisualBoard_Query.getCard;
        if (!card) return;

        const {
            cards
        } = board;
        let updatedCards = [...cards];

        // Card data need to be transformed after getting response from graphql.
        let transformCard = transformCardData(card);
        addCardProperties(transformCard, board);

        // Update cards array in following cases.
        // 1. card can be added from table and is not existing in cards array.
        // 2. card can be added by restoring card and is existing in cards array.

        const existingCard = cards.find((c) => c.sys_id === card.sys_id);
        if (!existingCard) {
            updatedCards.push(transformCard);
        } else {
            updatedCards = replaceItemInArray(updatedCards, transformCard);
        }
        return {
            ...board,
            cards: updatedCards
        };
    };

    const addPlaceHolderCardhandler = (boardState, payload) => {
        const {
            position,
            lane_id,
            swim_lane_id
        } = payload.card;

        const order = position === 'top' ? -1 : getLastCardOrder(boardState.cards, lane_id);

        const newCard = {
            id: 'placeholderCard',
            title: 'New card',
            isPlaceholder: true,
            order: order,
            lane_id: lane_id,
            swim_lane_id: swim_lane_id,
            board_id: boardState.sys_id,
            removed: false
        };

        return {
            ...boardState,
            cards: [...boardState.cards, newCard]
        };
    };

    const removePlaceHolderCardHandler = (boardState, payload) => {
        const updatedCards = boardState.cards.filter((card) => !card.isPlaceholder);

        // Remove placeholder card
        const placeholderCard = updatedCards.find((card) => card.isPlaceholder);
        if (placeholderCard)
            updatedCards.splice(updatedCards.indexOf(placeholderCard), 1);

        return {
            ...boardState,
            cards: updatedCards
        };
    };

    const addDataDrivenOptimisticCardHandler = (boardState, boardDirtyState, payload) => {
        const {
            position,
            laneId,
            swimlaneId,
            boardId,
            taskId
        } = payload;
        const order = position === 'top' ? 0 : getLastCardOrder(boardState.cards, laneId, swimlaneId);
        return {
            dbPayload: {
                operationName: ADD_CARD,
                operationPayload: {
                    boardId: boardId,
                    laneId: laneId,
                    swimlaneId: swimlaneId,
                    order: order,
                    taskId: taskId
                }
            }
        };
    };

    const addCardSuccessHandler = (boardState, boardFocusState, payload) => {
        const {
            data: {
                output: {
                    data: {
                        GlideVisualBoard_Mutation: {
                            createCard
                        }
                    }
                }
            }
        } = payload;

        const card = transformCardData(createCard);
        if (card.order === 0) {
            // The correct order will be updated by Amb in 'reorder_cards' event
            card.order = -1;
        }


        const updatedBoard = setFocusableElementOnBoard({
            operation: ADD_CARD,
            boardState,
            boardFocusState,
            element: card,
            elementType: "card"
        });

        return {
            newBoardDirtyState: sortAllCards(updatedBoard.boardState),
            newBoardFocusState: updatedBoard.boardFocusState
        };
    }

    const sortAllCards = (boardState) => {
        let newCards = [];
        boardState.lanes.forEach((lane) => {
            newCards = newCards.concat(
                boardState.cards
                .filter((card) => card.lane_id === lane.sys_id)
                .sort((a, b) => a.order - b.order)
                .map((card, cardIndex) => {
                    card.order = cardIndex;
                    return card;
                })
            );
        });

        // As we are maintaining one card array and not deleting cards after lane deleted because
        // It card can be restored later. So there will be a case where we have deleted lane and card
        // belong to that lane will be present in cards array and should be shown in archive card
        // panel. Since we are dispatching this action on card move we need to handle this case
        // separately.
        const laneIds = boardState.lanes.map((lane) => {
            return lane.sys_id;
        });

        let cardsInDeletedLane = [];
        boardState.cards.forEach((card) => {
            if (!laneIds.includes(card.lane_id)) cardsInDeletedLane.push(card);
        });

        const updatedCards = newCards.concat(cardsInDeletedLane);
        return {
            ...boardState,
            cards: updatedCards
        };
    };

    const getLastCardOrder = (cards, laneId, swimlaneId) =>
        cards.filter((card) => {
            if (swimlaneId) return card.lane_id === laneId && card.swim_lane_id === swimlaneId;

            return card.lane_id === laneId;
        }).length;

    const uploadAttachmentHandler = (api, snHttp, payload, helpers) => {
        const {
            action,
            data,
            loadAttachmentRecord,
            sysId,
            type,
            table
        } = payload;
        const fileName = data.getAll('file')[0]['name'];
        const url = `/angular.do?action=${action}&load_attachment_record=${loadAttachmentRecord}&sys_id=${sysId}&sysparm_type=${type}&table=${table}`;
        snHttp(url, {
            method: "POST",
            body: data
        })
        .then((response) => {
            showAlertAndInitiateDismiss(api, {content: `"${fileName}" ${ATTACHMENT_UPLOAD_SUCCESS_MESSAGE}`, icon: CIRCLE_CHECK_OUTLINE}, helpers);
        })
        .catch((error) => {
            showAlertAndInitiateDismiss(api, {status: CRITICAL, content: `"${fileName}" ${ATTACHMENT_UPLOAD_FAILURE_MESSAGE}`, icon: CIRCLE_CLOSE_OUTLINE}, helpers);
        });
    };

    return {
        moveCardHandler,
        moveCardSuccessHandler,
        moveCardFailureHandler,
        moveCardOptimisticHandler,
        archiveCardSuccessHandler,
        fetchArchiveCardSuccessHandler,
        fetchArchiveCardsSuccessHandler,
        restoreCardSuccessHandler,
        fetchVTBCardSuccessHandler,
        addPlaceHolderCardhandler,
        removePlaceHolderCardHandler,
        addDataDrivenOptimisticCardHandler,
        addCardSuccessHandler,
        uploadAttachmentHandler
    };
}
