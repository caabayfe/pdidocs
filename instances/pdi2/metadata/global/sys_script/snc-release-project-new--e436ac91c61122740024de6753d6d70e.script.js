//
// Set the release manager equal to the related product manager
//
if (!current.product.isNil()) {
   if (current.manager.isNil()) {
      current.manager.setValue(current.product.manager);
   }
}
