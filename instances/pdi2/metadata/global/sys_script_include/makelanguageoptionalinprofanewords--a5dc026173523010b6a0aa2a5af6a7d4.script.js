
      var makeLanguageOptionalInProfaneWords = Class.create();
        makeLanguageOptionalInProfaneWords.prototype = {
          initialize: function() {
        },
    
        removeMandatoryField: function() {
          var gr = new GlideRecord("sys_dictionary");
          gr.addQuery("name", "sys_cs_profane_word");
          gr.addQuery("element", "language");
          gr.addQuery("mandatory", true);
          gr.setWorkflow(false);
          gr.query();
          if (gr.next()) {
            gr.setValue("mandatory", false);
            gr.update();
          }
        },

        type: 'makeLanguageOptionalInProfaneWords'
      };
