var FnvHashGenerator = Class.create();
FnvHashGenerator.prototype = {
    initialize: function() {},

    hash: function(str) {
        // FNV-1a constants for 64-bit hash (same as Java)
        let hash = 0xcbf29ce484222325n; // FNV offset basis
        const prime = 1099511628211n;   // FNV prime

        for (let i = 0; i < str.length; i++) {
            // XOR the hash with the current character's byte value (Java treats input as bytes)
            hash ^= BigInt(str.charCodeAt(i) & 0xff);

            // Multiply the hash by the FNV prime
            hash *= prime;

            // Emulate Java's 64-bit overflow
            hash &= 0xffffffffffffffffn;
        }

        // Normalize to always return positive (same as Java)
        return hash & 0x7fffffffffffffffn;
    },

    type: 'FnvHashGenerator'
};
