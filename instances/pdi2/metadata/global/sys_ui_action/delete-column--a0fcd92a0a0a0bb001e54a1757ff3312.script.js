if (current.name.nil()) {

  gs.addInfoMessage('Could not delete column - table name field was empty');
  gs.print('Could not delete column - table name field was empty');

} else if (current.element.nil()) {
  
  gs.addInfoMessage('Could not delete column - column name field was empty');
  gs.print('Could not delete column - column name field was empty');

} else {
  
  current.deleteRecord(); 
  gs.addInfoMessage('Column deleted');
  
}
