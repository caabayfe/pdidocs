
            
            /**
             * @param {params} params
             * @param {api} params.api
             * @param {any} params.event
             * @param {any} params.imports
             * @param {ApiHelpers} params.helpers
             */
            function handler({
                api,
                event,
                helpers,
                imports
            }) {
                const value = event.payload.value;
                
                api.data.save_user_preference.execute({
                    name: 'displayLayoutPreference',
                    value: value
                });

                api.data.sn_record_list_data_broker.toggleLiveListSubscriptionByLayout({
                    layout: value
                });
                api.setState('displayedLayout', value);
                api.data.sn_record_list_data_broker.listLayoutItemSet({
                layout: value
                });
            }
