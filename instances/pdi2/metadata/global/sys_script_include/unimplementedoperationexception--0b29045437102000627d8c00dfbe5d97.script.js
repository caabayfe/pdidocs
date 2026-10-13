/**
 * A logic exception that is thrown when expected or intended functionality is not available.
 * @author Roy Laurie <roy.laurie@service-now.com> RAL
 */
var UnimplementedOperationException = Class.create();
UnimplementedOperationException.prototype = Object.extendsObject(GenericException);
