function script({ api, event }) {
        const globalSearchConfigurations = api.context?.app?.global_search_configurations;
        let selectedContent = {...event?.payload?.selectedContent};
        if(!selectedContent || typeof selectedContent.route !== 'string') {
            selectedContent = {...api.state.selectedContent};
        }
        if (globalSearchConfigurations && selectedContent && Object.keys(selectedContent).length) {
            const parsedGlobalSearchConfigurations = JSON.parse(globalSearchConfigurations);
            if (parsedGlobalSearchConfigurations?.hideSearchPanelPages) {
                const hideSearchPanelPages = parsedGlobalSearchConfigurations.hideSearchPanelPages || [];
                const currentPage = selectedContent.route;
                if(hideSearchPanelPages.includes(currentPage)) {
                    api.setState('enableSearch', false);
                }
            }
            api.setState('selectedContent', selectedContent);
        }
    }
