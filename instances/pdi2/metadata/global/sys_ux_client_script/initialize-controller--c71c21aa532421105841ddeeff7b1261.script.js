function onMacroponentReady({
      api,
      event
    }) {
      // setting static values
      api.setState('heading', api.context.props.uiInputConfig.heading);
      api.setState('subheading', api.context.props.uiInputConfig.subheading);
      api.setState('initialTopics', api.context.props.initialTopics);
      api.setState('initialTopicsForNetSelection', api.context.props.initialTopics);
      api.setState('primaryButtonLabel', api.context.props.uiInputConfig.primaryButtonLabel);
      api.setState('secondaryButtonLabel', api.context.props.uiInputConfig.secondaryButtonLabel);
      api.setState('selectedTaxonomy', api.context.props.initialTaxonomy);
      api.setState('catalogSysId',api.context.props.catalogSysId);
    }
