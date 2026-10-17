
      
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
          var fieldProps = event.payload.openRecordProps;
          if (fieldProps) {
              helpers.navigate.to(fieldProps.table === 'kb_knowledge' ? 'kb_view' : 'record', {
                  'table': fieldProps.table,
                  'sysId': fieldProps.sys_id
              }, {}, false, false, 'current');

          }
      }
