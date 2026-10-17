function include({imports}) {
     const getScanDefinitionId = (api, event, helpers) => {
          const kbId = api.state.knowledgeBase || 'All';
          const kbData = api.state.kbData || {};
          const scanData = kbData && kbData[kbId]?.topScans || [];
          const elementId = event.elementId || "";
          let scanDefinitionId = "";
          const scanIndex = parseInt(elementId.split('_').pop(), 10);

          if (scanData.length && scanIndex <= scanData.length) {
               const kbIdMap = kbData && kbData[kbId];
               const kbKey = scanData[scanIndex];
               scanDefinitionId = kbIdMap[kbKey]?.scanDefinitionSysId;
          }
          return scanDefinitionId;
     }
     const navigateToPage = (api, sysId, helpers) => {
          // Validate sysId is valid before navigation
          if (!sysId) {
               console.error('Invalid sysId: Navigation aborted');
               return;
          }
          
          const kbId = api.state.knowledgeBase;
          const params = {
               scanEncodedQuery: 'scan_definition=' + sysId
          };
          
          // Add kbEncodedQuery based on knowledgeBase value
          if (kbId && kbId !== 'All') {
               params.kbEncodedQuery = 'kb_knowledge_base=' + kbId + '^latest=true';
          } else {
               // For 'All', filter by writable KBs only (user has contribute access)
               const writableKBs = api.data['fetch_writable_knowledge_bases_1']?.output || '';
               
               // Build encoded query: kb_knowledge_baseIN<kb1>,<kb2>,<kb3>
               if (writableKBs) {
                    params.kbEncodedQuery = 'kb_knowledge_baseIN' + writableKBs + '^latest=true';
               } else {
                    params.kbEncodedQuery = 'latest=true';
               }
          }
          
          helpers.navigate.to('flagged-for-optimization', {}, params, false, false);
     };
     
     return {
            getScanDefinitionId: getScanDefinitionId,
            navigateToPage: navigateToPage
     };
}
