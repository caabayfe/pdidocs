(function executeRule(current, previous /*null when async*/) {
      const uniqueProps = new Set();
	    const propsArray = JSON.parse(current.props);

      for (let i = 0; i < propsArray.length; i++) {
		    const propName = propsArray[i].name;        		    
        if (uniqueProps.has(propName)) {
          gs.error('Duplicate element found in Properties: ' + propName);                
          current.setAbortAction(true);
          var errorMessage = gs.getMessage('Duplicate keys are not allowed in properties: {0}', GlideStringUtil.escapeHTML(propName));
          gs.addErrorMessage(errorMessage);
          return;
        }
        uniqueProps.add(propName);        
      }
})(current, previous);
