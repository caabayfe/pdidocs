/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({ api, event, helpers, imports }) {
    try {
      var summary = (api.data['get_ipki_migration_list_rows'] &&
                     api.data['get_ipki_migration_list_rows'].output &&
                     api.data['get_ipki_migration_list_rows'].output.summary) || {};
      var now = '' + new Date().getTime();

      var labels = await Promise.all([                                                                                              
          helpers.translate('mid_setup_migration_card_eligible',     'Eligible MID Servers'),
          helpers.translate('mid_setup_migration_card_not_started',  'Not started'),                                                
          helpers.translate('mid_setup_migration_card_in_progress',  'In progress'),
          helpers.translate('mid_setup_migration_card_succeeded',    'Succeeded'),                                                  
          helpers.translate('mid_setup_migration_card_failed',       'Failed')
      ]);                                                                                                                           
      var labelEligible   = labels[0];                      
      var labelNotStarted = labels[1];                                                                                              
      var labelInProgress = labels[2];                      
      var labelSucceeded  = labels[3];                                                                                              
      var labelFailed     = labels[4];                                                            
                                                        
      function makeCard(label, count) {                     
          return [{
              data: [{
                  value: '' + (count != null ? count : 0),                                                                          
                  change: '0',
                  changePercent: '0'                                                                                                
              }],                                           
              metadata: {
                  dataSourceLabel: label,
                  changeArrow: 'steady',
                  scoreDate: now,                                                                                                   
                  previousScoreDate: now,
                  aggregate: { fieldType: 'decimal' },                                                                              
                  format: { unitFormat: '{0}', frequency: 'daily', precision: 0 }
              }                                                                                                                     
          }];
      }                                                                                                                             
                                                            
      api.setState('cardEligible',   makeCard(labelEligible,   summary.eligible));                                                  
      api.setState('cardNotStarted', makeCard(labelNotStarted, summary.notStarted));
      api.setState('cardInProgress', makeCard(labelInProgress, summary.inProgress));                                                
      api.setState('cardSucceeded',  makeCard(labelSucceeded,  summary.succeeded));                                                 
      api.setState('cardFailed',     makeCard(labelFailed,     summary.failed));
  
      var eligibleCount = (summary.eligible != null) ? summary.eligible : 0;
      var bannerBody = await helpers.translate('mid_server_list_page.migration_banner.body', { count: eligibleCount });
      api.setState('migrationBannerBody', bannerBody);
      api.setState('migrationEligibleCount', eligibleCount);
      
    } catch (e) {
      // Migration data unavailable (broker/translate failure) -> hide the banner and log.
      api.setState('migrationEligibleCount', 0);
      console.error('[migration-banner] failed to compute banner state:', e);
    }
  }  
