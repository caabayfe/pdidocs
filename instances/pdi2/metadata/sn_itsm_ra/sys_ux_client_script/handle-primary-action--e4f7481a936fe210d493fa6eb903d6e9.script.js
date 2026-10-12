/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
      if(api.state.customExpProps != undefined){
            const {
              task,
              knowledge,
              additional_notes
          } = api.state.customExpProps.actionInputs;

          const {
              number,
              short_description,
          } = api.data.get_preview_fields.result;

          const viewportPayload = {
              viewportElementId: "viewport_1",
              route: "attach-article-in-comment-modal",
              fields: {'taskSysId': task,
                  'kbSysId': knowledge,
                  'title': short_description.displayValue,
                  'kbNumber': number.displayValue,
                },
              params: {
                  "additionalNotes": additional_notes
              }
          };
          api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', viewportPayload);

      } else if(api.context.props != undefined){

          const {
            task,
            knowledge,
            guidance_input_form_fields: {
                additional_notes
                },
            } = api.context.props.guidanceInputs;

            const {
              number,
              shortDescription,
          } = api.data.get_knowledge_record_details.articleDetails.articleInfo;


          const viewportPayload = {
              viewportElementId: "viewport_1",
              route: "attach-article-in-comment-modal",
              fields: {'taskSysId': task.value,
                  'kbSysId': knowledge.value,
                  'title': shortDescription,
                  'kbNumber': number
                },
              params: {
                  "additionalNotes": (additional_notes!=null) ? (additional_notes.recordValue ? additional_notes.recordValue.displayValue : '') : ''
              }
          };
        api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', viewportPayload);
      }
      api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
                event: "Click - Attach and add link in comment",
                value:{
                    "Guidance" : "Show genius result"
                }
            });

}
