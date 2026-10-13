/**
 * A logic exception that is thrown when existing functionality that is not intended for immediate use is accessed.
 * @author Roy Laurie <roy.laurie@service-now.com> RAL
 */
var UnsupportedOperationException = Class.create();
UnsupportedOperationException.prototype = Object.extendsObject(GenericException);
