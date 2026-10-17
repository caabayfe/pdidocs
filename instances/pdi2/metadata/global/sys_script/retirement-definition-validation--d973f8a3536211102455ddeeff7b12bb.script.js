(function executeRule(current, previous /*null when async*/) {

    var gr = new GlideRecord("cmdb_retirement_custom_definitions");
    gr.addQuery("table", current.getValue("table"));
    gr.query();

    //one record per table
    if(gr.next() && gr.getUniqueValue() != current.getUniqueValue()){
      gs.addErrorMessage(gs.getMessage("Only one definition per cmdb table is allowed."));
      current.setAbortAction(true);
    }

    //no use of "OR" conditions
    var encodedQuery = current.getValue("retirement_definition");
    
    if(encodedQuery.includes('^OR') || encodedQuery.includes('^NQ')){
      gs.addErrorMessage(gs.getMessage("The use of 'OR' conditions are not permitted when defining retirement state. Single conditions and conjoined conditions using 'AND' are allowed"));
      current.setAbortAction(true);
    }

    //check for non '=' pairs
    var encodedPairs = encodedQuery.split('^');
    for(var i = 0; i < encodedPairs.length; i++){
      if('EQ'.equals(encodedPairs[i])) //default final clause in all encoded queries
        continue;
      if (encodedPairs[i].indexOf('!=') > 0 || encodedPairs[i].indexOf('=') < 0) {
        gs.addErrorMessage(gs.getMessage("All retirement definitions must be in the form of '<field> is <value>' statements"));
        current.setAbortAction(true);
        break;
      }

      var pair = encodedPairs[i].split('=');
        if (pair.length != 2 || gs.nil(pair[0]) || gs.nil(pair[1])) {
          gs.addErrorMessage(gs.getMessage("All retirement definitions must be in the form of '<field> is <value>' statements"));
        current.setAbortAction(true);
        break;
      }
    }
  })(current, previous);
