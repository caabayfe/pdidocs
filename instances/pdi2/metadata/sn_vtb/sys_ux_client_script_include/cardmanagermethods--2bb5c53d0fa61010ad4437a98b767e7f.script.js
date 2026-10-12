function include({ imports }) {
    const {
        'sn_vtb.laneHandlers': laneHandlersInclude,
        'sn_vtb.utils': utilsInclude,
        'sn_vtb.moveCard': moveCard
    } = imports;

    const { getQuery } = laneHandlersInclude();
    const { cloneDeep } = utilsInclude();
	/**
	 * This method is used to transform the record array into an object.
	 * @param cardData
	 */
    const transformCardData = (cardData) => {
        let record = {};
        cardData.id = cardData.sys_id;
        cardData.record.forEach((field) => {
            let fieldValue;
            if (field.value.hasOwnProperty('string')) {
                fieldValue = field.value.string;
            } else if (field.value.hasOwnProperty('boolean')) {
                fieldValue = field.value.boolean;
            } else {
                fieldValue = field.value;
                if (fieldValue.value && fieldValue.value.length === 1) fieldValue.value = fieldValue.value[0];
            }

            record[field.name] = fieldValue;
        });
        cardData.record = record;

        if (cardData.sys_updated_on && cardData.sys_updated_on.hasOwnProperty('date_time'))
            cardData.sys_updated_on = cardData.sys_updated_on.date_time;

        return cardData;
    };

    // I'm not so sure whether this method is necessary. This method was used in classic VTB's DnD flow. Though in seismic
    // VTB, The GraphQL query anyway specifically asks for labels and due_date_field in the output so the data should always
    // contain these props. Opinions ? PS: I don't know when these properties might be missing for some reason.
    const addCardProperties = (cardData, board) => {
        const previousCardData = board.cards.find((c) => c.id === cardData.sys_id);

        if (previousCardData) {
            const dueDateField = board.due_date_field;

            if (
                dueDateField &&
                previousCardData.record.hasOwnProperty(dueDateField) &&
                !cardData.record.hasOwnProperty(dueDateField)
            )
                cardData.record[dueDateField] = previousCardData.record[dueDateField];

            if (previousCardData.hasOwnProperty('labels') && !cardData.hasOwnProperty('labels'))
                cardData.labels = previousCardData.labels;
        }
        return cardData;
    };

    function getUser(userId, users) {
        return users.find((user) => userId === user.sys_id);
    }

    const addUsersToCard = (card, boardUsers) => {
        // Card users
        let users = {};
        const {
            assigned_to
        } = card.record;
        users.primary_assignees = [];
        if (assigned_to && assigned_to.value) {
            let user = getUser(assigned_to.value, boardUsers);
            if(user){
                if(user.avatar) assigned_to.avatar = user.avatar;
                //Todo: Fetch for users not on board
                users.primary_assignees.push(user);
            }
        }

        // Additional Assignee list
        const {
            additional_assignee_list
        } = card.record;
        users.additional_assignees = [];
        if (additional_assignee_list) {
            if (typeof additional_assignee_list.value === 'string') {
                const additionalAssignee = additional_assignee_list.value;
                additional_assignee_list.value = [additionalAssignee];
            }
            additional_assignee_list.value.forEach((userId) => {
                let user = getUser(userId, boardUsers);
                if(user) users.additional_assignees.push(user);
            });
        }

        card.users = users;
    };
    const reOrderCards = (board, payload) => {
        const updatedCardIds = payload.cardIdList;
        const cards = board.cards;
        const reorderedCards = cards.filter((card) => updatedCardIds.indexOf(card.sys_id) > -1);
        const cardsCopy = [...cards];

        reorderedCards.forEach((card) => {
            const updatedCard = cloneDeep(card);
            updatedCard.order = updatedCardIds.indexOf(updatedCard.sys_id);
            const index = cards.findIndex((c) => c.sys_id === updatedCard.sys_id);
            cardsCopy.splice(index, 1, updatedCard);
        });

        let updatedBoard = {
            ...board,
            cards: cardsCopy
        }
        return sortCards(updatedBoard);
    }

    const sortCards = (board) => {

        let newCards = [];
        board.lanes.forEach((lane) => {
            newCards = newCards.concat(
                board.cards
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
        const laneIds = board.lanes.map((lane) => {
            return lane.sys_id;
        });

        let cardsInDeletedLane = [];
        board.cards.forEach((card) => {
            if (!laneIds.includes(card.lane_id)) cardsInDeletedLane.push(card);
        });

        const updatedCards = newCards.concat(cardsInDeletedLane);

        return {
            ...board,
            cards: updatedCards
        };
    }

    const constructVtbCardFormData = (boardState,payload ,cardAdded) => {
        const newCardData = {
            ...payload.card,
            isVisible: true,
            recordId: cardAdded ?  "-1" : payload.card.task_id 
        };
         const lane = boardState.lanes.find((lane) => lane.sys_id === payload.card.lane_id);
         const swimlane = payload.card.swim_lane_id ? boardState.swimlanes.find((smlane) => smlane.sys_id === payload.card.swim_lane_id) : null;
        if (lane) {
            lane.options = {
                table: boardState.table,
                lane_field: boardState.field
            }
        }
        if (swimlane) {
            swimlane.options = {
                table: boardState.table,
                swimlane_field: boardState.swim_lane_field
            }
        }

        const swimlaneQuery = swimlane ? getQuery(swimlane) : "";
        const laneQuery = lane ? getQuery(lane) : "";

        let query = `${laneQuery}`;
        if (swimlaneQuery) {
            query = `${laneQuery}^${swimlaneQuery}`;
        }
        newCardData.query = query;
        return newCardData;
    }

    return {
       moveCard,
        transformCardData,
        addCardProperties,
        addUsersToCard,
        reOrderCards,
        constructVtbCardFormData
    }
}
