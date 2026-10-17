function script({ api, event }) {
      const selectedTopicsForCurrentTaxonomy =  api.data.generate_net_selection_from_topic_ids.netSelection[api.state.selectedTaxonomy];
      
      api.setState('netSelection', api.data.generate_net_selection_from_topic_ids.netSelection);
      api.setState('initialNetSelection', api.data.generate_net_selection_from_topic_ids.netSelection);
      
      api.setState('selectedTopics', selectedTopicsForCurrentTaxonomy);
      api.setState('initialSelectedTopics', selectedTopicsForCurrentTaxonomy);
    }
