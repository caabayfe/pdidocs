var NLUInterface = Class.create();

NLUInterface.prototype = {

    /**
        Returns all the mapped intents count for each model
        Supports optional filter 'models' in format: 
        {
            <model1>: [<intent11>, <intent12>, ...],
            <model2>: [<intent21>, <intent22>, ...],
            ...
        }
        Result: 
        {
            <model>: <intent count>
            ...
        }
    */
    getAllMappedIntentsCount: function(models) {},

    /**
        Returns all mapped intent details for given model
        Optionally we can provide list of intents to filter the result. 
        Result: 
        {
            application: <Consumer application name: VA or Search>,
            mappings: {
                <intent name>: {
                    id: <Unique ID - topic sys_id or template id>,
                    name: <Type of the mapping (VA Topic or Genius Template): Topic name or genius template name>,
                    link: <Direct link to the topic or template>
                }
                ...
            }
        }
    */
    getMappedIntents: function(model, intents) {},

    initialize: function() {},

    type: 'NLUInterface'
};
