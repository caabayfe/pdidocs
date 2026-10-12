  if (current.order.isNil() ||  current.order == 100) {  
      var phases = current.name.getChoices(null);
      var order = 100; 
      var name = current.name.toString();
      for (var i = 0; i < phases.size(); i++) {
         var phase = phases.get(i);
         if (name == phase)
            break;
         order += 100;
      }
      current.order.setValue(order);
  }
