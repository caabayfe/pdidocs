var DMSCleanupConversationDocuments = Class.create();
  DMSCleanupConversationDocuments.prototype = {
      DOCUMENT_REFERENCES_TABLE : 'ds_document_references',
      DOCUMENT_TABLE            : 'ds_document',
      CONVERSATION_TABLE        : 'sys_cs_conversation',
      DOCUMENT_FIELD            : 'document',
      RETENTION_DAYS            : 30,
      BATCH_SIZE                : 200,

      initialize: function() {},

      /**
       * Orchestrates the cleanup of conversation-linked documents:
       * 1. Identifies ds_document records with exactly one entry in ds_document_references.
       * 2. Narrows that set to only documents whose single reference points to a sys_cs_conversation.
       * 3. Deletes matching documents not updated within the retention window, in batches.
       *    Cascade rules automatically remove child records (versions, permissions, approvers, etc.).
       *    Note: deleteMultiple() is void — it returns no count or success indicator; the logged
       *    count reflects records matched and attempted for deletion, not confirmed deletions.
       */
      execute: function() {
          try {
              gs.info('Document Management: Starting conversation document cleanup job');
              var singleReferenceDocIds = this._getDocsWithSingleReference();
              if (!singleReferenceDocIds.length) {
                  gs.info('Document Management: No documents with a single reference found. Exiting cleanup.');
                  return;
              }
              var conversationDocIds = this._filterByConversationReference(singleReferenceDocIds);
              if (!conversationDocIds.length) {
                  gs.info('Document Management: No documents with a single sys_cs_conversation reference found. Exiting cleanup.');
                  return;
              }
              this._deleteOldDocuments(conversationDocIds);
          } catch (e) {
              gs.error('Document Management: Cleanup job failed. Error: ' + e);
          }
      },

      _getDocsWithSingleReference: function() {
          var referenceAggregate = new GlideAggregate(this.DOCUMENT_REFERENCES_TABLE);
          referenceAggregate.addAggregate('COUNT', this.DOCUMENT_FIELD);
          referenceAggregate.groupBy(this.DOCUMENT_FIELD);
          referenceAggregate.addHaving('COUNT', this.DOCUMENT_FIELD, '=', 1);
          referenceAggregate.query();
          var singleReferenceDocIds = [];
          while (referenceAggregate.next())
              singleReferenceDocIds.push(referenceAggregate.getValue(this.DOCUMENT_FIELD));
          return singleReferenceDocIds;
      },

      _filterByConversationReference: function(documentIds) {
          var conversationDocIds = [];
          for (var i = 0; i < documentIds.length; i += this.BATCH_SIZE) {
              var documentBatch = documentIds.slice(i, i + this.BATCH_SIZE);
              var conversationRef = new GlideRecord(this.DOCUMENT_REFERENCES_TABLE);
              conversationRef.addQuery(this.DOCUMENT_FIELD, 'IN', documentBatch.join(','));
              conversationRef.addQuery('table_name', this.CONVERSATION_TABLE);
              conversationRef.query();
              while (conversationRef.next())
                  conversationDocIds.push(conversationRef.getValue(this.DOCUMENT_FIELD));
          }
          return conversationDocIds;
      },

      _deleteOldDocuments: function(documentIds) {
          var totalAttempted = 0;
          for (var i = 0; i < documentIds.length; i += this.BATCH_SIZE) {
              var documentBatch = documentIds.slice(i, i + this.BATCH_SIZE);
              var documentRecord = new GlideRecord(this.DOCUMENT_TABLE);
              documentRecord.setWorkflow(false); // intentional: suppresses notifications and hooks for batch cleanup; cascade rules still apply
              documentRecord.addQuery('sys_id', 'IN', documentBatch.join(','));
              documentRecord.addQuery('sys_updated_on', '<=', gs.daysAgo(this.RETENTION_DAYS));
              documentRecord.query();
              totalAttempted += documentRecord.getRowCount();
              documentRecord.deleteMultiple();
          }
          gs.info('Document Management: Cleanup complete. Attempted to delete {0} document(s).', totalAttempted);
      },

      type: 'DMSCleanupConversationDocuments'
  };
