/**
 * A runtime exception thrown when the state of an object is not valid for the attempted operation.
 * @author Roy Laurie <roy.laurie@service-now.com> RAL
 */
var IllegalStateException = Class.create();
IllegalStateException.prototype = Object.extendsObject(GenericException);
