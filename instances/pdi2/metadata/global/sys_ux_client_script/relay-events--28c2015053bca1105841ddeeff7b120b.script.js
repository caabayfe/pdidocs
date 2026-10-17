
        /*Relay script, that has the logic for each type of event, to set the correct controller state and send payload to relayed events*/
        function relay({
            api,
            event,
            helpers
        }) {
            switch (event.name) {
                case 'EX_TOPIC_SELECTOR#TOPIC_SAVE_REQUESTED': {
                    let _selectedTaxonomy = event.payload.selectedTaxonomy;
                    let _selectedTopics = event.payload.selectedTopics;
                    let netSelection = JSON.parse(JSON.stringify(api.state.netSelection == undefined ? {} : api.state.netSelection));
                    netSelection[_selectedTaxonomy] = _selectedTopics;
                    api.setState('selectedTaxonomy', _selectedTaxonomy);
                    api.setState('selectedTopics', _selectedTopics);
                    api.setState('initialSelectedTopics', _selectedTopics);
                    api.setState('netSelection', netSelection);
                    api.setState('initialNetSelection', netSelection);
                    helpers.timing.setTimeout(() => {
                        api.data.generate_connected_content_from_topics_script.execute({
                            catalogSysId: api.state.catalogSysId,
                            netSelection: netSelection,
                            existingTopics: api.state.initialTopics
                        });
                    }, 0);
                    api.emit('EX_TOPIC_SELECTOR#TOPIC_SAVE', {
                        currentTaxonomyTopics: _selectedTopics,
                        currentTaxonomy: _selectedTaxonomy,
                        netSelection: netSelection
                    });
                    break;
                }
                case 'EX_TOPIC_SELECTOR#TOPIC_CANCEL_REQUESTED': {
                    const lastSavedTopicsForTaxonomy = api.state.initialNetSelection[api.state.selectedTaxonomy] || [];
                    api.setState('selectedTopics', lastSavedTopicsForTaxonomy);
                    api.setState('netSelection', api.state.initialNetSelection);
                    api.emit('EX_TOPIC_SELECTOR#TOPIC_CANCEL');
                    break;
                }
                case 'EX_TOPIC_SELECTOR#TOPIC_CHANGE_REQUESTED': {
                    api.setState('selectedTopics', event.payload.selectedTopics);
                    let newNetSelection = JSON.parse(JSON.stringify(api.state.netSelection == undefined ? {} : api.state.netSelection));
                    let selectedTaxonomy = api.state.selectedTaxonomy;
                    newNetSelection[selectedTaxonomy] = event.payload.selectedTopics;
                    api.setState('netSelection', newNetSelection);
                    api.emit('EX_TOPIC_SELECTOR#TOPIC_CHANGE', {
                        currentTaxonomyTopics: event.payload.selectedTopics,
                        currentTaxonomy: selectedTaxonomy,
                        netSelection: newNetSelection
                    });
                    break;
                }
                case 'EX_TOPIC_SELECTOR#TAXONOMY_CHANGE_REQUESTED': {
                    let netSelection = JSON.parse(JSON.stringify(api.state.netSelection == undefined ? {} : api.state.netSelection));
                    let taxonomy = event.payload.selectedTaxonomy;
                    if (!(taxonomy in netSelection))
                        netSelection[taxonomy] = [];
                    api.setState('selectedTaxonomy', event.payload.selectedTaxonomy);
                    api.setState('netSelection', netSelection);
                    const currentTaxonomySelectedTopics = netSelection[taxonomy];
                    const arrayOfTopics = currentTaxonomySelectedTopics.map(item => {
                        //item is an array, get last index id
                        return item[item.length - 1].id;
                    });
                    api.setState('selectedTopics', currentTaxonomySelectedTopics);
        
                    api.emit('EX_TOPIC_SELECTOR#TAXONOMY_CHANGE', {
                        currentTaxonomyTopics: currentTaxonomySelectedTopics,
                        currentTaxonomy: event.payload.selectedTaxonomy,
                        netSelection: netSelection
                    });
                    helpers.timing.setTimeout(() => {
                        api.data.get_topics_list.refresh(); //Explicitly invoke the graph ql api to refresh topic data on taxonomy change
                    }, 0);
                    break;
                }
            }
        }
