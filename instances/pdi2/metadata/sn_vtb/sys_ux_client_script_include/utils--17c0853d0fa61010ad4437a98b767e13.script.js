function include({imports}) {
    const {
        'sn_vtb.constants': constantsInclude,
         'sn_vtb.loadashUtil': loadashUtil
    } = imports;
    const {
        ELEMENTS_IDS: {
            MUTATION_DATA_BROKER_ELEMENT_ID
        },
        DATA_BROKERS_IDS: {
            MUTATION_DATA_BROKER_ID
        },
        DATA_BROKER_OP: {
            CARD_ARCHIVED,
            ADD_CARD,
            DELETE_LANE
        }
    } = constantsInclude();
     const {
        cloneDeep,
        get
     } = loadashUtil();

    const removeCardFromLane = (laneId, swimLaneId, cardId, board) => {
        if (laneId) {
            var laneCards = board.cards.filter((card) => card.lane_id === laneId);
            return removeItem(laneCards, cardId);
        }

        if (swimLaneId) {
            var swimlaneCards = board.cards.filter((card) => card.swim_lane_id === swimLaneId);
            return removeItem(swimlaneCards, cardId);
        }
    };

    function removeItem(arr, item) {
        return arr.splice(arr.indexOf(item), 1);
    }

    /**
     * Can be used to replace an item in the array with an updated one and return a new array.
     * @param existingArray
     * @param updatedItem
     * @param identifier
     * @returns {*[]}
     */
    const replaceItemInArray = (existingArray, updatedItem, identifier = 'sys_id') => {
        const updatedArray = [...existingArray];
        const index = updatedArray.findIndex((element) => element[identifier] === updatedItem[identifier]);
        updatedArray[index] = updatedItem;

        return updatedArray;
    };
    /**
     * Can be used to delete an item in the array and return the new array.
     * @param existingArray
     * @param updatedItem
     * @param identifier
     * @returns {*[]}
     */
    const deleteItemInArray = (existingArray, updatedItem, identifier = 'sys_id') => {
        const index = existingArray.findIndex((element) => updatedItem[identifier] === element[identifier]);
        const updatedArray = [...existingArray];
        updatedArray.splice(index, 1);

        return updatedArray;
    };

    const execGraphQLEndPoint = (operationName, operationPayload, emit) => {
        const dbPayload =  {
            operation: {
                dataBrokerId: MUTATION_DATA_BROKER_ID,
                parentResourceId: MUTATION_DATA_BROKER_ELEMENT_ID,
                dataElementId: MUTATION_DATA_BROKER_ELEMENT_ID,
                operationName
            },
            operationPayload
        }
        emit("UXF_DB_OP_TRIGGER_REQUESTED", dbPayload);
    };

    const getErrorMessage = (errors, format = 'html') => {
        const messageRegex = /fCode: +?(\d+?); +?fMessage: +?([\w \.]*?)\)/g;
        let messages = [];
        if (errors && Array.isArray(errors)) {
            messages = errors.map((error) => {
                let msg = error.message;
                 if(!msg)
                   return;

                const match = msg.matchAll(messageRegex).next();
                // handle translation if we are able to retrieve a message.
                // format messages based on the code
                return match.done ? msg : match.value[2];
            });
        }
        // might need more improvements to this method going forward
        return messages.join(format === 'html' ? '<br />' : ',');
    };

const setFocusableElementOnBoard = ({operation, boardFocusState, element, boardState, elementType}) => {
boardState = resetFocusableItemOnBoard(boardState , boardFocusState);
boardFocusState = {};
let card;
    switch (operation) {
        case ADD_CARD:
        card = element;
    if (boardState.boardType === 'FREEFORM') {
            card.isFocus = true;
            boardFocusState = {
                operation,
                id: card.sys_id,
                elementType: "card"
            };
            boardState = { ...boardState, cards: [...boardState.cards, card] };
    }
    break;

        case CARD_ARCHIVED:
            card = element;
            const focusableElement = getFocusableElement(boardState, card);
            focusableElement.elem.isFocus = true;
            boardFocusState = {
                operation,
                id: focusableElement.elem.sys_id,
                elementType: focusableElement.elementType
            };

            if (focusableElement.elementType === "card") {
                let updatedCards = [...boardState.cards];
                updatedCards = replaceItemInArray(updatedCards, focusableElement.elem);
                boardState = { ...boardState, cards: updatedCards };
            } else if(focusableElement.elementType === "lanes"){
                let updatedLanes = [...boardState.lanes];
                updatedLanes = replaceItemInArray(updatedLanes, focusableElement.elem);
                boardState = { ...boardState, lanes: updatedLanes };
            }else {
                let updatedSwimLanes = [...boardState.swimlanes];
                updatedSwimLanes = replaceItemInArray(updatedSwimLanes, focusableElement.elem);
                boardState = { ...boardState, swimlanes: updatedSwimLanes };
           }
            break;


        case DELETE_LANE:
            ({boardState, boardFocusState} = handleFocusOnDeleteOrHideLane({operation, boardState, lane: element, laneType: elementType}));
            break;

        case 'HIDE_LANE':
            ({boardState, boardFocusState} = handleFocusOnDeleteOrHideLane({operation, boardState, lane: element, laneType: elementType}));
            break;
    }
    return {
        boardFocusState,
        boardState
    };
};


const handleFocusOnDeleteOrHideLane = ({operation, boardState, lane, laneType}) => {
    let updatedLanes = laneType === "lane" ? [...boardState.lanes] : [...boardState.swimlanes];
    let focusableLane;
    let boardFocusState = {};
    let lanes = laneType === "lane" ? boardState.lanes : boardState.swimlanes;
    lanes = lanes.filter(l => !boardState.hidden_lanes.includes(l.sys_id));
    if(lanes.length === 1) { //Only one lane exists, we move the focus to Add new swimlane/Add new lane button
        boardFocusState = {
            operation,
            id: laneType === "lane" ? 'addNewLane_sysId' : 'addNewSwimlane_sysId',
            elementType: laneType
        };
    } else {
        const deletedLaneIndex = lanes.findIndex(l => l.sys_id === lane.sys_id);
        //last lane deleted, focus moves to the previous lane
        if(lanes.length - 1 === deletedLaneIndex) {
            focusableLane = lanes[deletedLaneIndex - 1];
        } else {
            focusableLane = lanes[deletedLaneIndex + 1];
        }
         focusableLane.isFocus = true;
         boardFocusState = {
                operation,
                id: focusableLane.sys_id,
                elementType: laneType
        };
        updatedLanes = replaceItemInArray(updatedLanes, focusableLane);
        boardState = laneType === "lane" ? { ...boardState, lanes: updatedLanes } : { ...boardState, swimlanes: updatedLanes}
    }

    return  {
        boardState,
        boardFocusState
    }
}

const getFocusableElement = (boardState, card) => {
    let focusableElement = {};
    const {cards, lanes , swimlanes}  = boardState;
    if(!card.swim_lane_id){
        focusableElement = getFocusableElementOnBoard(cards,lanes, card , "lane");
    } else {
        focusableElement = getFocusableElementOnBoard(cards,swimlanes, card , "swimlane");
    }

    return focusableElement;
}

const getFocusableElementOnBoard = (cards, array, card , type) =>{
    let focusableElement = {};
    let cardsInLane = [];
    if(type === "swimlane") {
        cardsInLane = cards.filter((c) => (
             c.swim_lane_id === card.swim_lane_id &&
             c.lane_id === card.lane_id &&
             c.removed === false)).sort((a, b) => a.order - b.order);
    } else {
        cardsInLane = cards.filter((c) => (c.lane_id === card.lane_id && c.removed === false)).sort((a, b) => a.order - b.order);
    }
    const archivedCardIndex = cardsInLane.findIndex((c) => c.sys_id === card.sys_id);
    if (cardsInLane.length === 1) {   // It means there is only one card in that lane so focusable element should be lane header after card archived.
        focusableElement.elementType = type;
        if(type === "swimlane"){
            focusableElement.elem = array.find((l) => l.sys_id === card.swim_lane_id);
        } else{
            focusableElement.elem = array.find((l) => l.sys_id === card.lane_id);
        }

    } else if (archivedCardIndex + 1 === cardsInLane.length) {     // Case when last card from lane is deleted.
        focusableElement.elementType = "card";
        focusableElement.elem = cardsInLane[archivedCardIndex - 1];
    } else {
        focusableElement.elementType = "card";
        focusableElement.elem = cardsInLane[archivedCardIndex + 1];
    }

    return focusableElement;
}

const resetFocusableItemOnBoard = (boardState, boardFocusState) => {
    const { elementType } = boardFocusState;

    if (elementType && elementType === "card") {
        let updatedCards = [...boardState.cards];
        const cards = boardState.cards;
        const focusableCard = cards.find((c) => c.isFocus && c.isFocus === true);
        if (focusableCard) {
            focusableCard.isFocus = false;
            updatedCards = replaceItemInArray(updatedCards, focusableCard);
            boardState = { ...boardState, cards: updatedCards };
        };
    }

    if (elementType && elementType === "lane") {
        let updatedLanes = [...boardState.lanes];
        const lanes = boardState.lanes;
        const focusableLane = lanes.find((l) => l.isFocus && l.isFocus === true);
        if (focusableLane) {
            focusableLane.isFocus = false;
            updatedLanes = replaceItemInArray(updatedLanes, focusableLane);
            boardState = { ...boardState, lanes: updatedLanes };
        };
    };

if (elementType && elementType === "swimlane") {
        let updatedSwimLanes = [...boardState.swimlanes];
        const swimlanes = boardState.swimlanes;
        const focusableSwimLane = swimlanes.find((sl) => sl.isFocus && sl.isFocus === true);
        if (focusableSwimLane) {
            focusableSwimLane.isFocus = false;
            updatedSwimLanes = replaceItemInArray(updatedSwimLanes, focusableSwimLane);
            boardState = { ...boardState, swimlanes: updatedSwimLanes };
        };
    };

    return boardState;
};

const translateWrapper = (key, tPromise)  => {
        return new Promise((resolve, reject) => {
            tPromise.then(tText => {
                resolve({
                    key,
                    tText
                })
            })
        });
};
    return {
        cloneDeep,
        get,
        removeCardFromLane,
        replaceItemInArray,
        deleteItemInArray,
        execGraphQLEndPoint,
        getErrorMessage,
        resetFocusableItemOnBoard,
        setFocusableElementOnBoard,
        translateWrapper
    };
}
