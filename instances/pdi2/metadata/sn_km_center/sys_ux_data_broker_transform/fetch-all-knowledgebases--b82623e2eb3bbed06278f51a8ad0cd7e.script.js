  function transform(input) {
      var options = [{ label: 'All', value: 'all' }];
      var writableKbSysIds = '';

      var knowledgeBaseSI = new global.KBKnowledgeBase();
      var writableKBs = knowledgeBaseSI.getWritableKnowledgeBases();

      if (writableKBs) {
          writableKbSysIds = writableKBs;

          var gr = new GlideRecordSecure('kb_knowledge_base');
          gr.addUserEncodedQuery('active=true^sys_idIN' + writableKBs);
          gr.orderBy('title');
          gr.query();

          while (gr.next()) {
              options.push({
                  label: gr.getDisplayValue('title'),
                  value: gr.getUniqueValue()
              });
          }
      }

      return { kbOptions: options, writableKbSysIds: writableKbSysIds, hasLoaded: true };
  }
