function transform(input) {
    var graphqlOutputPayload = input.graphqlOutputPayload;
    var recordTypeToEvamTemplate = input.recordTypeToEvamTemplate;
    if (graphqlOutputPayload) {
        //  var board = graphqlOutputPayload.data.GlideVisualBoard_Query.getBoard;
        var board = graphqlOutputPayload.result;
        if (board) {
            // Default tags
            board.cardTag = 'sn-vtb-card';
            board.cardDraggable = true;
            board.cardDragPlaceholderTag = 'sn-vtb-card-src-placeholder';
            board.cardDropPlaceholderTag = 'sn-vtb-card-dest-placeholder';
            board.cardConfigOverride = {
                placeholderCard: {
                    draggable: false,
                    tag: 'sn-vtb-freeform-card-editable'
                }
            };

            board.laneHeaderTag = 'sn-vtb-lane-header';
            board.laneFooterTag = 'sn-vtb-lane-footer';
            board.laneDraggable = true;
            board.laneDragPlaceholderTag = 'sn-vtb-lane-src-placeholder';
            board.laneDropPlaceholderTag = 'sn-vtb-lane-dest-placeholder';
            board.laneConfigOverride = {
                addNewLane_sysId: {
                    draggable: false,
                    droppable: false,
                    hide_in_reorder: true,
                    tag_lane_header: 'sn-vtb-add-lane',
                    tag_lane_footer: 'div'
                }
            };

            board.swimlaneHeaderTag = 'sn-vtb-swimlane-header';
            board.swimlaneHeaderCloneTag = 'sn-vtb-swimlane-header-clone';
            board.swimlaneDraggable = true;
            board.swimlaneDragPlaceholderTag = 'sn-vtb-swimlane-src-placeholder';
            board.swimlaneDropPlaceholderTag = 'sn-vtb-swimlane-dest-placeholder';
            board.swimlaneConfigOverride = {
                addNewSwimlane_sysId: {
                    draggable: false,
                    droppable: false,
                    hide_in_reorder: true,
                    tag_swimlane_header: 'sn-vtb-add-swimlane'
                }
            };

            board.loadTagsFromUxf = true;

            board.useArrowNavigation = true;
            board.arrowNavigableElements =
                '.now-card,.sn-vtb-lane-header,.swimlane-add-btn,.lane-add-btn,.add-card,.sn-vtb-swimlane-header .container';
            board.wrapperDomEvents = [{
                on: [
                    'sn-lane-header',
                    'sn-card-wrapper',
                    'sn-swimlane-header',
                    'lane-footer-container',
                ],
                events: ['keydown'],
                action: 'VTB#WRAPPER_DOM_ACTION_PERFORMED',
            }];

            board.customScrollOptions = {
                'enableScroll': false,
                'scrollTrackCSS': {
                    'margin-bottom': '30px'
                },
            };

            board._style_ = {
                'sn-board': {
                    'background-color': '#B5D1C5'
                }
            };

            // EVAM template
            if (recordTypeToEvamTemplate) {
                board.recordTypeToEvamTemplate = recordTypeToEvamTemplate;
            }

            if (board.lastSynchronized) {
                board.last_synchronized = {
                    'present': board.lastSynchronized.dateTime
                };
                delete board.lastSynchronized;
            }

            if (board.listViewName) {
                board.list_view_name = {
                    'present': board.listViewName
                };
                delete board.listViewName;
            }
			
			if(board.sysUpdatedOn) {
				board.sys_updated_on = board.sysUpdatedOn.dateTime;
				delete board.sysUpdatedOn;
			}

            /*var laneDiscriminators = board.lane_discriminators = {};
            if (board.laneDiscriminators) {
                board.laneDiscriminators.forEach(function(ld) {
                    laneDiscriminators[ld.name] = ld.value;
                });
                delete board.laneDiscriminators;
            }*/

            // Users 
            if (board.assignees) {
                board.assignees.forEach(function(user) {
                    user.isMember = false;
                });
            }

            if (board.members) {
                board.members.forEach(function(user) {
                    user.isMember = true;
                });
            }
            board.users = [].concat(board.assignees).concat(board.members);

            // Labels
            board.labels = board.labels || [];

            // Cards
            if (board.cards) {
                board.cards.forEach(function(card) {
                    card.attachments = card.attachments || [];
					if(card.sysUpdatedOn) {
						card.sys_updated_on = card.sysUpdatedOn.dateTime;
						delete card.sysUpdatedOn;
					}
                   
                   /* var newRecord = {};
                    card.record.forEach(function(field) {
                        var fieldValue;
                        if (field.value.hasOwnProperty('string')) {
                            fieldValue = field.value.string;
                        } else if (field.value.hasOwnProperty('boolean')) {
                            fieldValue = field.value['boolean'];
                        } else {
                            fieldValue = field.value;

                            // If the fieldValue is [empty string] or ["single element"]
                            if (fieldValue.value && fieldValue.value.length === 1) fieldValue.value = fieldValue.value[0];
                        }
                        newRecord[field.name] = fieldValue;
                    });
                    card.record = newRecord; */

                    if (card.record.short_description)
                        card.title = card.record.short_description.display_value;
                });
            }

            board.hidden_lanes = board.hidden_lanes || '';
            if (board.hidden_lanes !== '') {
                board.hidden_lanes = board.hidden_lanes.split('-');
            } else {
                board.hidden_lanes = [];
            }

            if (board.lanes) {
                var swimlanes = board.lanes
                    .filter(function(lane) {
                        return lane.is_swim_lane;
                    });

                var lanes = board.lanes
                    .filter(function(lane) {
                        return !lane.is_swim_lane;
                    });

                board.lanes = lanes;
                board.swimlanes = swimlanes;
            }

            // Add order to cards in each lane
            board.lanes.forEach(function(lane) {
                board.cards
                    .filter(function(card) {
                        return card.lane_id === lane.id;
                    })
                    .sort(function(a, b) {
                        return a.order - b.order;
                    })
                    .forEach(function(card, cardIndex) {
                        card.order = cardIndex;
                    });
            });

            return {
                "board": board
            };
        }
    }
    return;
}
