function include({
    imports
}) {
    const {
        'sn_vtb.constants': constantsInclude,
        'sn_vtb.utils': utilsInclude,
        'sn_vtb.cardManagerMethods': cardManagerMethodsInclude
    } = imports;

    const {
        BOARD: {
            FREEFORM,
            FLEXIBLE,
            GUIDED
        },
        MENU_ITEMS: {
            ADD_CARD,
            HIDE_LANE,
            MOVE_LANE,
            DELETE_LANE,
            ARCHIVE_ALL_CARDS,
            COLLAPSE_ALL,
            EXPAND_ALL,
            MOVE_SWIMLANE,
            HIDE_SWIMLANE,
            DELETE_SWIMLANE,
            ARCHIVE_CARD,
            MOVE_CARD
        }
    } = constantsInclude();
    const {
        addUsersToCard
    } = cardManagerMethodsInclude();
    const {
        cloneDeep,
        get
    } = utilsInclude();

    function highestLaneOrder(lanes) {
        if (lanes.length === 0) return 0;
        return Math.max.apply(
            Math,
            lanes.map(function(lane) {
                return lane.order;
            })
        );
    }

    function getCardActionItems(cardId, boardType, translatedMessages) {
        const getCardActionItem = [{
            id: 'move_card',
            label: translatedMessages[MOVE_CARD],
            uuid: cardId
        }];
        const getArchiveCardOption = [{
            id: 'archive_card',
            label: translatedMessages[ARCHIVE_CARD],
            uuid: cardId
        }];

        const dropdownItems = [{
            id: 'cardActions_section',
            children: getCardActionItem,
            uuid: cardId
        }];
        if (boardType === FREEFORM)
            dropdownItems.unshift({
                id: 'archiveCard_section',
                children: getArchiveCardOption,
                uuid: cardId
            });

        return dropdownItems;
    };

    function hasDeleteOption(lane, options) {
        return !(
            (options.board_type === GUIDED && lane.value === '') ||
            (options.board_type === GUIDED && lane.cardsCount > 0) ||
            (options.board_type === GUIDED && lane.is_choice_lane) ||
            (options.board_type === FLEXIBLE && lane.cardsCount > 0) ||
            (lane.is_reference_lane && options.lane_filter)
        );
    };

    function hasSwimlaneDeleteOption(swimlane, options) {
        return !(
            (options.board_type === GUIDED && swimlane.value === '') ||
            (options.board_type === GUIDED && swimlane.cardsCount > 0) ||
            (options.board_type === GUIDED && swimlane.is_choice_lane) ||
            (options.board_type === FLEXIBLE && swimlane.cardsCount > 0) ||
            (swimlane.is_reference_lane && options.swimlane_filter)
        );
    };

    function getSwimlaneActionItems(swimlane, translatedMessages) {
        const {
            id: swimlaneId,
            options,
            cardsCount
        } = swimlane;
        const swimlaneDropdownItems = [{
                id: 'collapseAllSl',
                label: translatedMessages[COLLAPSE_ALL],
                uuid: swimlaneId,
                disabled: swimlane.collapsed
            },
            {
                id: 'expandAllSl',
                label: translatedMessages[EXPAND_ALL],
                uuid: swimlaneId,
                disabled: !swimlane.collapsed
            },
            {
                id: 'hideSwimlane',
                label: translatedMessages[HIDE_SWIMLANE],
                uuid: swimlaneId
            },
            {
                id: 'moveSwimlane',
                label: translatedMessages[MOVE_SWIMLANE],
                uuid: swimlaneId
            }
        ];
        if (hasSwimlaneDeleteOption(swimlane, options)) {
            swimlaneDropdownItems.push({
                id: 'deleteSwimlane',
                label: translatedMessages[DELETE_SWIMLANE],
                uuid: swimlaneId
            });
        }
        if (options.board_type === FREEFORM && cardsCount > 0) {
            swimlaneDropdownItems.push({
                id: 'archiveAllCards',
                label: translatedMessages[ARCHIVE_ALL_CARDS],
                uuid: swimlaneId
            });
        }
        return swimlaneDropdownItems;
    };

    function getLaneActionItems(lane, translatedMessages) {
        const {
            id: laneId,
            options,
            cardsCount
        } = lane;
        let dropdownItems = [];
        if (!options.is2DBoard && options.can_add_task) {
            dropdownItems.push({
                id: 'addCard',
                label: translatedMessages[ADD_CARD],
                uuid: laneId
            });
        }
        dropdownItems = [
            ...dropdownItems,
            {
                id: 'hideLane',
                label: translatedMessages[HIDE_LANE],
                uuid: laneId
            },
            {
                id: 'moveLane',
                label: translatedMessages[MOVE_LANE],
                uuid: laneId
            }
        ];
        if (hasDeleteOption(lane, options)) {
            dropdownItems.push({
                id: 'deleteLane',
                label: translatedMessages[DELETE_LANE],
                uuid: laneId
            });
        }

        if (options.board_type === FREEFORM && cardsCount > 0) {
            dropdownItems.push({
                id: 'archiveAllCards',
                label: translatedMessages[ARCHIVE_ALL_CARDS],
                uuid: laneId
            });
        }
        return dropdownItems;
    };

    const transformBoardData = (boardData, boardFocusData) => {
        const newBoardData = cloneDeep(boardData);
        const is2DBoard = newBoardData.swimlanes.length > 0 && newBoardData.swim_lanes_enabled;

        const options = {
            show_sla: newBoardData.show_sla,
            show_labels: newBoardData.show_labels,
            show_cover_image: newBoardData.show_cover_image,
            due_date_field: newBoardData.due_date_field,
            show_card_info: newBoardData.show_card_info,
            board_type: newBoardData.boardType,
            card_type: (newBoardData.compact_cards || is2DBoard) ? 'compact' : 'classic'
        };

        const laneOptions = {
            board_type: newBoardData.boardType,
            is2DBoard: is2DBoard,
            lane_filter: newBoardData.lane_filter,
            lane_count: newBoardData.lanes.length,
            total_lane_count: newBoardData.lanes.length + newBoardData.swimlanes.length,
            field_reference_table: newBoardData.field_reference_table,
            lane_field: newBoardData.field,
            swimlane_field: newBoardData.swim_lane_field,
            table: newBoardData.table,
            reference_lane_search_field: newBoardData.reference_lane_search_field,
            highest_lane_order: highestLaneOrder(newBoardData.lanes),
            can_add_task: newBoardData.can_write_board && newBoardData.can_create_card
        };

        const swimlaneOptions = {
            board_type: newBoardData.boardType,
            swimlane_filter: newBoardData.swim_lane_filter,
            swimlane_count: newBoardData.swimlanes.length,
            total_lane_count: newBoardData.lanes.length + newBoardData.swimlanes.length,
            swim_lane_field_reference_table: newBoardData.swim_lane_field_reference_table,
            lane_field: newBoardData.field,
            swimlane_field: newBoardData.swim_lane_field,
            table: newBoardData.table,
            reference_swim_lane_search_field: newBoardData.reference_swim_lane_search_field,
            highest_swimlane_order: highestLaneOrder(newBoardData.swimlanes)
        };

        newBoardData.cards = newBoardData.cards.map((card) => {
            if (card.isPlaceholder) return card;

            // Labels
            if (card.labels) {
                card.labels.forEach((label) => {
                    let boardLabel = newBoardData.labels.find((boardLabel) => boardLabel.id === label.id);
                    //Todo: Maintain the boardLabels at card level to show in card details
                    if (!boardLabel) return;
                    if (!boardLabel.active) {
                        label.active = false;
                    }
                    label.color = boardLabel.color;
                    label.value = boardLabel.value;
                });
            }

            // Card users
            if (!card.users) addUsersToCard(card, newBoardData.users);

            return {
                ...card,
                id: card.sys_id,
                title: get(card, 'record.short_description.display_value', ''),
                options: {
                    ...options
                }
            };
        });

        //Add lane button placeholder
        const addLane = {
            id: 'addNewLane_sysId',
            title: 'Add lane button',
            isPlaceholder: true,
            value: '',
            order: laneOptions.highest_lane_order + 1,
            board_id: newBoardData.sys_id,
            lanes_reference_table_records: '',
            options: {
                ...laneOptions
            }
        };
        if(boardFocusData && boardFocusData.id == 'addNewLane_sysId') {
            addLane.isFocus = true;
        }

        const canAddLanes =
            (newBoardData.boardType === GUIDED && newBoardData.can_create_reference_lane) ||
            newBoardData.boardType === FLEXIBLE ||
            newBoardData.boardType === FREEFORM;

        //Add swimlane button placeholder
        const addSwimlane = {
            id: 'addNewSwimlane_sysId',
            title: 'Add swimlane button',
            isPlaceholder: true,
            value: '',
            order: swimlaneOptions.highest_swimlane_order + 1,
            board_id: newBoardData.sys_id,
            swimlanes_reference_table_records: '',
            options: {
                ...swimlaneOptions
            },
            collapsed: true,
            addLaneButton: canAddLanes,
            _style_: {
                'sn-swimlane-header': {
                    'margin-top': '12px'
                }
            }
        };
        if(boardFocusData && boardFocusData.id == 'addNewSwimlane_sysId') {
            addSwimlane.isFocus = true;
        }
        const canAddSwimlanes =
            (newBoardData.swim_lane_field_reference_table !== null && newBoardData.can_create_reference_swim_lane) ||
            newBoardData.boardType === FLEXIBLE ||
            newBoardData.boardType === FREEFORM;

        newBoardData.hiddenLanes = newBoardData.hidden_lanes || [];
        const hiddenLaneMap = {};
        newBoardData.hiddenLanes.forEach((lane) => hiddenLaneMap[lane] = true);


        newBoardData.lanes.forEach((lane) => {
            if (lane.is_reference_lane && lane.value !== '') addLane.lanes_reference_table_records += lane.value + ',';
        });

        newBoardData.swimlanes.forEach((slane) => {
            if (slane.is_reference_lane && slane.value !== '')
                addSwimlane.swimlanes_reference_table_records += slane.value + ',';
        });

        newBoardData.lanes = newBoardData.lanes.filter((lane) => !newBoardData.hidden_lanes.includes(lane.sys_id));
        newBoardData.swimlanes = newBoardData.swimlanes.filter(
            (slane) => !newBoardData.hidden_lanes.includes(slane.sys_id)
        );

        if (is2DBoard) {
            newBoardData.swimlanes = newBoardData.swimlanes
                .sort((a, b) => a.order - b.order)
                .map((slane, index) => {

                    slane.order = index;
                    slane.id = slane.sys_id;
                    slane.title = slane.name;
                    slane.addLaneButton = canAddLanes || newBoardData.can_create_reference_lane;
                    //Check if card is not removed
                    //and vertical lane should not be hidden
                    const thisSwimlaneCards = newBoardData.cards
                        .filter((card) => card.swim_lane_id === slane.sys_id && card.removed === false)
                        .filter((card) => !hiddenLaneMap[card.lane_id]);
                    slane.cardsCountPerLane = thisSwimlaneCards
                        .reduce((cPerLane, {
                            lane_id
                        }) => {
                            cPerLane[lane_id] = cPerLane[lane_id] ? 1 + cPerLane[lane_id] : 1;
                            return cPerLane;
                        }, {});
                    slane.cardsCount = thisSwimlaneCards.length;
                    slane._style_ = {
                        'sn-swimlane-header': {
                            'margin-top': '8px'
                        }
                    };
                    return {
                        ...slane,
                        options: {
                            ...swimlaneOptions
                        }
                    };
                });
        } else {
            newBoardData.swimlanes = [];
        }

        if (!is2DBoard)
            newBoardData._style_ = {
                'sn-board': {
                    //'background-color': '#B5D1C5',
                    'overflow-y': 'hidden',
                    'height': '100vh'
                }
            };
        else
            newBoardData._style_ = {
                'sn-board': {
                    //'background-color': '#B5D1C5',
                    'height': '100vh'
                }
            };

        newBoardData.lanes = newBoardData.lanes
            .sort((a, b) => a.order - b.order)
            .map((lane, index) => {
                lane.order = index;
                lane.id = lane.sys_id;
                lane.title = lane.name;
                //Check if card is not removed
                //and horizontal lane should not be hidden
                lane.cardsCount = newBoardData.cards.filter((card) => card.lane_id === lane.sys_id && card.removed === false)
                    .filter((card) => !card.swim_lane_id || !hiddenLaneMap[card.swim_lane_id]).length;

                if (is2DBoard) {
                    lane._style_ = {
                        'sn-lane': {
                            width: '285px',
                            padding: '4px',
                            height: '100%'
                        },
                        'lane-body': {
                            'margin-top': '8px'
                        },
                        'lane-footer-container': {
                            position: 'sticky',
                            bottom: '45px'
                        }
                    };
                } else {
                    lane._style_ = {
                        'sn-lane': {
                            width: '285px',
                            padding: '4px',
                            'overflow-y': 'auto',
                            height: 'calc(100% - 58px)'
                        },
                        'lane-footer-container': {
                            position: 'sticky',
                            bottom: '30px'
                        }
                    };
                }
                return {
                    ...lane,
                    options: {
                        ...laneOptions
                    }
                };
            });

        if (canAddLanes) newBoardData.lanes.push(addLane);
        if (canAddSwimlanes && newBoardData.swim_lanes_enabled) newBoardData.swimlanes.push(addSwimlane);

        const recordTypeToEvamTemplate = newBoardData.recordTypeToEvamTemplate;
        if (recordTypeToEvamTemplate) {
            const recordTypes = Object.keys(recordTypeToEvamTemplate);
            if (recordTypes.length) {
                const cardConfigOverride = (newBoardData.cardConfigOverride = {
                    ...newBoardData.cardConfigOverride
                });

                newBoardData.cards.forEach((card) => {
                    const record = card.record;
                    const recordType = record ? record.sys_class_name : null;

                    if (recordType && recordTypes.includes(recordType)) {
                        const template = recordTypeToEvamTemplate[recordType];

                        cardConfigOverride[card.sys_id] = {
                            ...cardConfigOverride[card.sys_id],
                            tag: template.component
                        };

                        const mappings = template.mappings;
                        if (mappings) {
                            const propNames = Object.keys(mappings);
                            propNames.forEach((propName) => {
                                let propObj = record[mappings[propName]];
                                if (propObj) card[propName] = propObj.display_value;
                            });
                        }
                    }
                });
            }
        }
        newBoardData.cards = newBoardData.cards.filter((card) => card.removed === false);

        // Constructing component menu action items
        newBoardData.lanes.forEach((lane) => {
            lane.options.menu_actions = getLaneActionItems(lane, newBoardData.translatedMessages);
        });

        newBoardData.swimlanes.forEach((swimlane) => {
            swimlane.options.menu_actions = getSwimlaneActionItems(swimlane,newBoardData.translatedMessages);
        });

        newBoardData.cards.forEach((card) => {
            if (card.id !== 'placeholderCard' && card.options)
                card.options.menu_actions = getCardActionItems(card.id, card.options.board_type, newBoardData.translatedMessages);
        });
        
        return newBoardData;
    };

    return {
        transformBoardData
    };
}
