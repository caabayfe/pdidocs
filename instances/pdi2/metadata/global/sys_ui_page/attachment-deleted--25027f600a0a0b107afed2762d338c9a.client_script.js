attachmentsDeleted();

      function attachmentsDeleted() {
          if (deletedAttachmentsStr) {
              parent.deletedAttachments("${JS:sysparm_deleted}");
          } else {
              parent.failedRefreshAttachments();
          }
      }
      
      if (parent.renderAttachmentOutputMessages)
          parent.renderAttachmentOutputMessages($j("#output_messages"));
