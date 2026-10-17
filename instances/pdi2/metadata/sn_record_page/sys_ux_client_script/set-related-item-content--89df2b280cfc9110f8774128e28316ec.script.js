/**
    * @param {params} params
    * @param {api} params.api
    * @param {event} params.event
    * @param {imports} params.imports
    * @param {helpers} params.helpers
    */
    function setRelatedTabContent({api, event}) {
        const relatedTabContent = event.payload.relatedTabContent;
        if (!relatedTabContent)
            api.setState('relatedTabContent', null); //If no content reset to null
        else {
            const resultTabContent = {
                ...api.state.relatedTabContent,
                ...relatedTabContent,
            };
            api.setState('relatedTabContent', resultTabContent);
        }
    }
 
