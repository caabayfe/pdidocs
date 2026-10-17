// Verify that the release to which a feature is assigned is for the same product as the product to which a feature is assigned.
// A feature is a part of a product
// A feature is a part of a release
// A release is a part of the product
// make sure that feature->release->product == feature->product
if (!current.product.isNil() && !current.release.isNil()) {
   if (current.product.toString() != current.release.product.toString()) {
	  var message=gs.getMessage('Release {0} is not defined as part of product {1}',[current.release.getDisplayValue(),current.product.getDisplayValue()])
      current.release.setError(message);
      current.setAbortAction(true);
   }
}
if (!current.release.isNil() && current.product.isNil())
  current.product.setValue(current.release.product);
