
      
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
          var eventActionProps = event.payload.actionProps;
          if (eventActionProps) {
              if (eventActionProps.type == 'guidedDecisionGuidance')
                  helpers.navigate.to('guidance', {
                      'recommender': eventActionProps.recommender,
                      'recommendedBy': eventActionProps.recommendedBy
                  }, {}, false, false, 'current');
              else if (eventActionProps.type == 'guidedDecision')
                  helpers.navigate.to('guided-decisions', {
                      'executionId': eventActionProps.executionId,
                      'decisionTreeId': eventActionProps.decisionTreeId
                  }, {}, false, false, 'current');
              else if (event.payload.actionProps.type == 'raExpandedSearch') {
                const {
                    contextTable,
                    contextId,
                    contextSysId,
                    searchTerm,
                    selectedFilterTab,
                    selectedFacetOptions,
                    selectedSortOption,
                    actionConfigurations
                } = event.payload.actionProps;
                helpers.navigate.to('ra-itsm-expanded-search', {
                    'contextTable': contextTable,
                    'contextId': contextId
                }, {
                    'contextSysId': contextSysId,
                    'searchTerm': searchTerm,
                    'selectedFilterTab': selectedFilterTab,
                    'selectedFacetOptions': selectedFacetOptions,
                    'selectedSortOption': selectedSortOption,
                    'actionConfigurations': JSON.stringify(actionConfigurations)
                }, false, false, 'current');
              }
          }
      }
