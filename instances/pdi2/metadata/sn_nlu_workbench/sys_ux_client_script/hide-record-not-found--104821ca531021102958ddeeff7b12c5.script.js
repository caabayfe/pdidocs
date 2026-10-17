/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const gFormData = api.data.gform.nowRecordFormBlob;
    // setting initial value to false
    api.setState('isValidRecord', false);
  
      if (gFormData) {
        const isValidRecord = gFormData.isValidRecord;
        const canReadRecord = gFormData.canReadRecord;
        
        api.setState('isValidRecord', isValidRecord && canReadRecord);
  
        const isNewRecord = gFormData.isNewRecord;
        api.setState('isNewRecord', isNewRecord);
  
        const hideRecordNotFound = isNewRecord || isValidRecord;
        api.setState('hideRecordNotFound', hideRecordNotFound);

        // Check for read access only when we don't show record not found message. 
        if (hideRecordNotFound) {
          const hideSecurityConstraints = isNewRecord || canReadRecord;
          api.setState('hideSecurityConstraints', hideSecurityConstraints);
        }
      }
  }
