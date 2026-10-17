
            var DocumentComparisionHelper = Class.create();
      DocumentComparisionHelper.prototype = {
          initialize: function() {},
          getListOfVersions: function(table, targetRecordId) {
              // getting document versions for a particular document.
              var documentVersionGr = new GlideRecord(table);
              documentVersionGr.addQuery("document.sys_id", targetRecordId);
              documentVersionGr.addQuery("type", "attachment");
              documentVersionGr.query();
              var docVersionList = [];
              var docVersionsysIdsList = [];

              while (documentVersionGr.next()) {
                  var docversion = {};
                  docversion.id = documentVersionGr.getValue("sys_id");
                  docversion.value = documentVersionGr.getValue("sys_id");
                  docversion.label = documentVersionGr.document.getRefRecord().getValue("name") + "#" + documentVersionGr.getValue("version");
                  docVersionsysIdsList.push(documentVersionGr.getValue("sys_id"));
                  docVersionList.push(docversion);

              }

              var attachmentGr = new GlideRecord("sys_attachment");
              attachmentGr.addQuery("table_sys_id", "IN", docVersionsysIdsList);
              attachmentGr.query();

              //attachment data based on document version sysId
              var attachmentData = {};

              //storing attachment name and sysId in a object.
              while (attachmentGr.next()) {
                  let fileName = attachmentGr.getValue("file_name");
                  attachmentData[attachmentGr.getValue("table_sys_id")] = {};
                  attachmentData[attachmentGr.getValue("table_sys_id")].sysId = attachmentGr.getUniqueValue();
                  attachmentData[attachmentGr.getValue("table_sys_id")].fileName = fileName;

              }

              //iterating over versions and replacing with attachment data to show in dropdown.
              const docVersionListForUI = docVersionList.filter(docVersion => {
				  if(!attachmentData[docVersion.id].fileName)
				  {
					return false;
				  }
                  let fileName = attachmentData[docVersion.id].fileName;
                  let version = docVersion.label.split("#")[1];

                  docVersion.value = fileName.substring(fileName.lastIndexOf("."));
                  docVersion.docType = fileName.substring(fileName.lastIndexOf("."));
                  docVersion.label = fileName + " (V " + version + ")";
                  docVersion.id = attachmentData[docVersion.id].sysId;
				  return true;
              });
              //version list response for Ui.
              return docVersionListForUI;
          },
          isCompareEnabled: function() {
              return gs.getProperty("glide.documents.compare.enabled", false);
          },

          type: 'DocumentComparisionHelper'
      };
