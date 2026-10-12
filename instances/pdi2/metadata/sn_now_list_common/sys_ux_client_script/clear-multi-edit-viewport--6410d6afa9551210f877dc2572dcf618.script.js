
            
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
                api.emit('VIEWPORT_ROUTE_DISMISSED', {
                    viewportElementId: 'list_panel_viewport',
                    route: 'multi-edit',
                    fields: {
                        sysIds: api.context.props.sysIds
                    }
                });
            }
