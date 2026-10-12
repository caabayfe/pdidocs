current.internal_type.setError("Cannot change a boolean field to a non-boolean field");
gs.log('update of ' + current.name + '.' + current.element + ' internal_type canceled to protect the boolean field');
current.setAbortAction(true);
