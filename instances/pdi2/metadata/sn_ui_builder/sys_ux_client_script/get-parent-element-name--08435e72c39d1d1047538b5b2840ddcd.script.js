
            
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
                const composition = api.data.look_up_parent_screen.result.macroponent._reference.composition;
                const parentElId = api.context.props.parentElementId;
                if (!parentElId) {
                    return;
                }

                const lookForParentElementInElement = (element) => {

                };

                const lookForParentElementInComposition = (composition) => {
                    for (const el of composition) {
                        if (el.elementId === parentElId) {
                            return el.elementLabel;
                        }
                        const children = [...(el.composition ? ? []), ...(el.overrides ? .composition ? ? [])];

                        return lookForParentElementInComposition(children);
                    }
                };
            }
