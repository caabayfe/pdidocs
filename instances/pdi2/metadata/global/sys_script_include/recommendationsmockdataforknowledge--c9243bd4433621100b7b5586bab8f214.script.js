var RecommendationsMockDataForKnowledge = Class.create();
RecommendationsMockDataForKnowledge.prototype = {
    DATA_MAPPING_OBJECT: {
		"Updated": [{
                name: 'Look Up Records',
                scopeName: 'Global'
            },
            {
                name: 'If',
                scopeName: ''
            },
            {
                name: 'Update Record',
                scopeName: 'Global'
            },
			{
                name: 'Look Up Record',
                scopeName: 'Global'
            },
        ],
        "Look Up Records": [{
                name: 'For Each',
                scopeName: ''
            },
            {
                name: 'Ask For Approval',
                scopeName: 'Global'
            },
            {
                name: 'If',
                scopeName: ''
            },
            {
                name: 'Update Record',
                scopeName: 'Global'
            }
        ],
        "For Each": [{
                name: 'If',
                scopeName: ''
            },
            {
                name: 'Update Record',
                scopeName: 'Global'
            }
        ],

        "If": [{
                name: 'Else',
                scopeName: ''
            },
            {
                name: 'ElseIf',
                scopeName: ''
            },
            {
                name: 'Update Record',
                scopeName: 'Global'
            }
        ],
        "Update Record": [{
                name: 'Else',
                scopeName: ''
            },
            {
                name: 'Update Record',
                scopeName: 'Global'
            },
            {
                name: 'Send Notification',
                scopeName: 'Global'
            },
            {
                name: 'Send Email',
                scopeName: 'Global'
            }
        ],
        "Send Notification": [{
                name: 'Log',
                scopeName: 'Global'
            },
            {
                name: 'Else',
                scopeName: ''
            }
        ],
    },
    initialize: function(itemName) {
        this.response = {
            fOutputs: [
                [{
                        name: 'model name'
                    },
                    [{
                        result: {
                            NextSteps: JSON.stringify(this.DATA_MAPPING_OBJECT[itemName])
                        }
                    }]
                ]
            ]
        };
    },
    type: 'RecommendationsMockDataForKnowledge'
};
