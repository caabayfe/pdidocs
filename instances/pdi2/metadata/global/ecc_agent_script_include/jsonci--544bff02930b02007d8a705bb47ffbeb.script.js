var JsonCi;
 
/*
 * JsonCi is a replacement for the Ci class.  JsonCi allows a developer to
 * build a web of JavaScript objects which will be written to the database
 * with references intact.  Circular references can't be represented in JSON,
 * which means an arbitrary web of objects can't be returned from a probe.
 * This code de-circularizes a JavaScript object so it can be stringified,
 * parsed and the re-circularized easily.
 * Decircularize/recircularize might be useful outside of JsonCi.  Consider
 * moving the code to a standalone include?
 */
(function() {

JsonCi = {
	decircularize: decircularize
};

/*
 * A (kind of) simple function to serialize an object.  The name comes from the fact
 * that you can't blindly serialize circular references.  This function will walk the
 * object's graph, serializing as it goes.  If we encounter an object that we've
 * already serialized (completely or partially) we'll create an object identifier for
 * it.  We write that into the serialization stream instead of trying to serialize
 * the first object again. This function returns the serialized object.  The original
 * object can be re-created by calling reattach() 
 *
 * One possible improvement in this function: De-circularized object references are
 * stored in the object itself as a special string value (the special value is
 * anything that starts with "$^".)  When parsing, any string value is assumed to be
 * an object reference if it matches the ID of a previous object.  It would be better
 * to store the IDs externally rather than use this magic prefix.
 *
 * This function returns a string which is expected to be passed to reattach()
 * (in the system script include "JsonCi".)
 * This means that we're not restricted to JSON if we need to change the implementation.
 */
function decircularize(o, replacer)
{
	var name,
		objects = { },
		objectIdName = '$objectName$',
		nextId = 1,
		deferred = [ ],
		output = { '$^1': o };

	try {
		decirc(o, 0);
		while (deferred.length)
			decirc(deferred.pop(), 0, 1);
	}
	catch(e) {
		ms.log(e.toString());
	}

	for (name in objects)
		delete objects[name][objectIdName];

	return JSON.stringify(output);

	function decirc(o, depth, ignoreName) {

		// If we've previously encountered 'o', it's decircularized by
		// returning the object identifier. If we haven't encountered it
		// just keep going - at that point we have a simple reference,
		// not a circular reference.  Note that the object ID is implicit
		// for simple references.  When re-attaching we need to create
		// the same IDs for the same objects.
		var id = o[objectIdName];
		if (id) {
			if (!ignoreName)
				return id;
		}
		else {
			// Generate an ID for the current object, add it to the object.
			// I'd prefer to create a map, but it would need to be keyed by
			// the object, which Rhino doesn't support.
			id = '$^' + nextId.toString(36);
			o[objectIdName] = id;
			objects[id] = o;
			nextId++;
		}

		// The path this function will take through the object graph won't necessarily
		// be the path you'd expect.  If you have two sets of objects which reference
		// each other (e.g. VMs and ESX servers) it can bounce back and forth between
		// them, recursing further each time, causing a Java stack overflow.  When I
		// saw this the stack depth was around 5000.  I don't want to defer more than
		// I need to, but it's better to err on the side of caution - the penalty for
		// deferring the recursion is fairly small.
		// Deferring means that we'll stop recursing and create an object ID for an
		// object which we haven't previously seen.  The object will be saved and
		// serialized as the root of its own graph later (if necessary).
		if (depth == 100) {
			output[id] = o;
			deferred.push(o);
			return id;
		}

		// Walk over an object, decircularizing references as we go.
		// Keys are sorted so we can ensure we that we will reattach
		// in the same order as we decircularized.
		Object.keys(o).sort().forEach(function(name) {
			var val = o[name];

			// Support for a replacer function, similar to JSON.stringify().
			if (replacer)
				val = o[name] = replacer(name, val);

			if ((typeof val == 'object') && (val !== null)) {
				if (val instanceof Packages.java.lang.Object)
					o[name] = undefined;
				else
					o[name] = decirc(val, depth + 1);
			}
		});

		return o;
	}
}

})();
