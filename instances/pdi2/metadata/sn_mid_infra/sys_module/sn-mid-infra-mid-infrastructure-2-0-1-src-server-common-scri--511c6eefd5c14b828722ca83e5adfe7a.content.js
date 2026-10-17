/**
 * ===================================================================================
 * PemCertificateParser - X.509 Certificate Parser
 * ===================================================================================
 * 
 
 * This file contains extensive inline documentation explaining:
 *   - WHAT each function does (purpose)
 *   - HOW it works (algorithm/approach)
 *   - WHY design decisions were made
 *   - WHEN to use each strategy/fallback
 *   - Examples with real data
 * 
 * KEY FUNCTIONS TO UNDERSTAND:
 *   1. getOidValue()         - Main entry point for extracting certificate attributes
 *   2. listSubjectAttributes() - Lists all attributes in Subject DN
 *   3. _findSubjectNode()    - Locates Subject DN using 4 fallback strategies (EXTENSIVELY DOCUMENTED)
 *   4. _pemToDer()           - Converts text certificates to binary
 *   5. _readAsn1()           - Parses ASN.1 TLV structures
 * 
 * LEARNING PATH:
 *   Start here → getOidValue() → getSubjectOidValue() → _findSubjectNode()
 *   Then explore: _readAsn1(), _readOID(), _pemToDer()
 * 
 * ===================================================================================
 * 
 * PURPOSE:
 * This class parses PEM-encoded X.509 certificates (the text format starting with
 * "-----BEGIN CERTIFICATE-----") and extracts specific attribute values using
 * Object Identifiers (OIDs).
 * 
 * WHAT ARE OIDS?
 * OIDs are unique identifiers for certificate attributes. Common examples:
 *   - 2.5.4.3  = CN (Common Name) - usually the domain name
 *   - 2.5.4.10 = O (Organization) - company name
 *   - 2.5.4.4  = SN (Surname) - serial number/instance ID
 *   - 2.5.4.42 = GN (Given Name) - first name/service type
 * 
 * WHAT THIS CLASS DOES:
 *   ✓ Extracts attributes from Subject Distinguished Name (who the certificate is for)
 *   ✗ Does NOT support SubjectAltName (SAN) extensions
 *   ✗ Does NOT validate certificate signatures
 *   ✗ Does NOT check certificate expiration
 * 
 * USAGE EXAMPLE:
 *   var parser = new PemCertificateParser();
 *   var cn = parser.getOidValue(pemCert, '2.5.4.3');  // Extract CN
 *   var attrs = parser.listSubjectAttributes(pemCert); // List all attributes
 * 
 * TECHNICAL DETAILS:
 * Implements ASN.1 DER parsing for X.509 certificates per RFC 5280.
 */
var PemCertificateParser = Class.create()
PemCertificateParser.prototype = {
    /**
     * Initialize the parser with debug mode disabled.
     * Debug mode can be enabled later using _setDebug(true).
     */
    initialize: function () {
        this._debug = false
    },

    /**
     * Enable or disable debug logging.
     * When enabled, detailed parsing steps are logged via gs.info().
     * 
     * @param {boolean} enabled - true to enable debug logs, false to disable
     */
    _setDebug: function (enabled) {
        this._debug = enabled === true
    },

    /**
     * Internal logging function. Only logs when debug mode is enabled.
     * 
     * @param {string} msg - Message to log
     */
    _log: function (msg) {
        if (this._debug) gs.info('PemCertificateParser: ' + String(msg))
    },

    /**
     * Extracts the value of a specific OID from anywhere in the certificate.
     * 
     * This is the MAIN ENTRY POINT for extracting certificate attributes.
     * 
     * HOW IT WORKS:
     *   1. First tries to find the OID in the Subject DN (fast path - 99% of use cases)
     *   2. If not found, performs a deep search through the entire certificate tree
     * 
     * WHY TWO APPROACHES?
     *   - Subject DN search is optimized and handles most common attributes (CN, O, etc.)
     *   - Full tree search is a fallback for extensions or unusual locations
     * 
     * EXAMPLE:
     *   var parser = new PemCertificateParser();
     *   var commonName = parser.getOidValue(certPem, '2.5.4.3');  // CN
     *   var orgName = parser.getOidValue(certPem, '2.5.4.10');    // Organization
     * 
     * @param {string} pem - PEM-encoded certificate (starts with "-----BEGIN CERTIFICATE-----")
     * @param {string} oid - OID to search for (e.g., "2.5.4.3" for CN)
     * @returns {string|null} The attribute value as a string, or null if not found
     */
    getOidValue: function (pem, oid) {
        try {
            var oidNorm = this._normalizeOidString(oid)
            this._log('getOidValue start oid=' + oidNorm)
            var bytes = this._pemToDer(pem)
            this._log('DER length=' + bytes.length)
            
            // Try Subject DN first (fastest)
            var res = this.getSubjectOidValue(pem, oidNorm)
            this._log('subject lookup result=' + (res === null ? 'null' : String(res)))
            if (res !== null && typeof res !== 'undefined') return res
            
            // Note: SubjectAltName (SAN) is not supported
            
            // Fallback: full certificate tree search
            res = this._findOidValue(bytes, 0, bytes.length, oidNorm, 0)
            this._log('fallback search result=' + (res === null ? 'null' : String(res)))
            return res
        } catch (e) {
            this._log('getOidValue error=' + e)
            return null
        }
    },

    listSubjectAttributes: function (pem) {
        try {
            var bytes = this._pemToDer(pem)
            var root = this._readAsn1(bytes, 0)
            if (!root || root.tag !== 0x30) return []
            var tbs = this._readAsn1(bytes, root.start)
            if (!tbs || tbs.tag !== 0x30) return []
            var children = this._readChildren(bytes, tbs)
            // Malformed certs may have too few TBS fields - gracefully return empty
            if (!children || children.length < 3) return []
            var subject = this._findSubjectNode(bytes, children)
            this._log('listSubjectAttributes subjectFound=' + (!!subject))
            // _findSubjectNode returns null (not exception) if no strategy succeeds
            if (!subject) return []
            var out = []
            var rdns = this._readChildren(bytes, subject)
            this._log('listSubjectAttributes rdnsCount=' + rdns.length)
            // RFC 5280: Subject DN is SEQUENCE OF RelativeDistinguishedName
            // Each RDN is a SET OF AttributeTypeAndValue
            for (var i = 0; i < rdns.length; i++) {
                var rdn = rdns[i]
                // Defensive: Skip malformed RDNs (should be SET with tag 0x31)
                if (!rdn || rdn.tag !== 0x31) continue
                var atvs = this._readChildren(bytes, rdn)
                // Defensive: _readChildren returns null if node is malformed
                if (!atvs) continue
                for (var j = 0; j < atvs.length; j++) {
                    var atv = atvs[j]
                    // Defensive: Skip malformed ATVs (should be SEQUENCE with tag 0x30)
                    if (!atv || atv.tag !== 0x30) continue
                    var comps = this._readChildren(bytes, atv)
                    // Defensive: AttributeTypeAndValue must have 2 components: {type: OID, value: ANY}
                    if (!comps || comps.length < 2) continue
                    var typeNode = comps[0]
                    var valNode = comps[1]
                    // Defensive: Type must be OID (tag 0x06)
                    if (typeNode.tag !== 0x06) continue
                    var oid = this._readOID(bytes, typeNode.start, typeNode.len)
                    var valueStr = ''
                    // RFC 5280: Subject DN values are string types (PrintableString, UTF8String, etc.)
                    if (this._isStringTag(valNode.tag)) {
                        valueStr = this._bytesToDirectoryString(bytes, valNode.tag, valNode.start, valNode.len)
                    } else {
                        // Defensive: Handle non-standard encodings (OCTET STRING, INTEGER, etc.)
                        // In practice, valid X.509 certs always use string types for Subject DN
                        valueStr = this._bytesToHex(bytes, valNode.start, valNode.len)
                    }
                    this._log('listSubjectAttributes push oid=' + oid + ' value=' + valueStr)
                    out.push({ oid: oid, value: valueStr })
                }
            }
            return out
        } catch (e) {
            this._log('listSubjectAttributes error=' + e)
            return []
        }
    },

    /**
     * Locates the Subject Distinguished Name (DN) within a TBSCertificate structure.
     * 
     * The Subject DN contains the identity information of the certificate holder (e.g., CN=example.com).
     * This function uses 4 cascading strategies to find it, with each strategy serving as a fallback
     * if the previous ones fail.
     * 
     * BACKGROUND:
     * X.509 certificates (RFC 5280) have this structure:
     *   TBSCertificate ::= SEQUENCE {
     *     version         [0]  EXPLICIT Version DEFAULT v1,     -- Optional
     *     serialNumber         CertificateSerialNumber,
     *     signature            AlgorithmIdentifier,
     *     issuer               Name,                            -- Issuer DN
     *     validity             Validity,
     *     subject              Name,                            -- <-- THIS IS WHAT WE'RE FINDING
     *     subjectPublicKeyInfo SubjectPublicKeyInfo,
     *     ...
     *   }
     * 
     * STRATEGY SELECTION GUIDE:
     * - Strategy 1: STANDARD - Handles 99.9% of modern certificates (post-2000)
     * - Strategy 2: FALLBACK - Handles unusual/legacy certificates (1990s-2000s)
     * - Strategy 3: LEGACY - Handles very old X.509v1 certificates (pre-1996)
     * - Strategy 4: LAST RESORT - Guesses based on structure (proprietary/test certs only)
     * 
     * @param {Array} bytes - The DER-encoded certificate bytes
     * @param {Array} tbsChildren - Array of ASN.1 nodes representing TBSCertificate children
     * @returns {Object|null} The Subject DN node, or null if not found
     */
    _findSubjectNode: function (bytes, tbsChildren) {
        // Sanity check: TBS must have at least 3 children (serial, signature, issuer)
        if (!tbsChildren || !tbsChildren.length || tbsChildren.length < 3) return null
        
        // ============================================================================
        // STRATEGY 1: SubjectPublicKeyInfo (SPKI) Detection [STANDARD APPROACH]
        // ============================================================================
        // HOW IT WORKS:
        //   - Looks for SubjectPublicKeyInfo, which contains a BitString (tag 0x03)
        //   - Subject DN is always the SEQUENCE immediately BEFORE the SPKI
        //
        // WHY IT WORKS:
        //   - RFC 5280 defines fixed order: ...validity, subject, subjectPublicKeyInfo...
        //   - SPKI always contains a BitString as its public key
        //
        // EXAMPLE STRUCTURE:
        //   SEQUENCE (Issuer)
        //   SEQUENCE (Validity)
        //   SEQUENCE (Subject) <-- We return this
        //   SEQUENCE (SPKI)
        //     SEQUENCE (Algorithm)
        //     BitString (0x03) <-- We detect this marker
        //
        // USAGE: 99.9% of certificates - ALL modern, standards-compliant certificates
        // ============================================================================
        for (var i = 0; i < tbsChildren.length; i++) {
            var node = tbsChildren[i]
            if (!node || node.tag !== 0x30) continue
            var kids = this._readChildren(bytes, node)
            if (!kids || kids.length < 2) continue
            // Check if second child is a BitString (0x03) - SPKI marker
            if (kids[1] && kids[1].tag === 0x03) {
                // Found SPKI! Subject is the previous SEQUENCE
                for (var j = i - 1; j >= 0; j--) {
                    if (tbsChildren[j] && tbsChildren[j].tag === 0x30) {
                        this._log('findSubjectNode via SPKI at index ' + j)
                        return tbsChildren[j]
                    }
                }
            }
        }
        
        // ============================================================================
        // STRATEGY 2: Validity Period Detection [FALLBACK FOR UNUSUAL CERTIFICATES]
        // ============================================================================
        // HOW IT WORKS:
        //   - Looks for Validity structure (contains 2 time nodes)
        //   - Subject DN is always the SEQUENCE immediately AFTER Validity
        //
        // WHY IT WORKS:
        //   - Validity is unique: it's the only structure with 2 consecutive time values
        //   - RFC 5280 order: ...issuer, validity, subject, subjectPublicKeyInfo...
        //
        // WHEN USED:
        //   - Strategy 1 failed (e.g., SPKI is malformed or missing BitString)
        //   - Old certificates from early 2000s with non-standard SPKI encoding
        //   - Certificates from buggy certificate generation tools
        //
        // EXAMPLE STRUCTURE:
        //   SEQUENCE (Validity) <-- We detect this
        //     UTCTime (0x17) or GeneralizedTime (0x18)
        //     UTCTime (0x17) or GeneralizedTime (0x18)
        //   SEQUENCE (Subject) <-- We return this
        //
        // USAGE: ~0.1% of certificates - Legacy or unusual certificate formats
        // ============================================================================
        for (var ci = 0; ci < tbsChildren.length - 1; ci++) {
            var maybeValidity = tbsChildren[ci]
            var nextNode = tbsChildren[ci + 1]
            if (!maybeValidity || maybeValidity.tag !== 0x30) continue
            var vKids = this._readChildren(bytes, maybeValidity)
            if (!vKids || vKids.length < 2) continue
            var t1 = (vKids[0] && vKids[0].tag) || 0
            var t2 = (vKids[1] && vKids[1].tag) || 0
            // Check if both children are time values (UTCTime or GeneralizedTime)
            var isTime = function(t) { return t === 0x17 || t === 0x18; }
            if (isTime(t1) && isTime(t2) && nextNode && nextNode.tag === 0x30) {
                this._log('findSubjectNode via Validity at index ' + (ci + 1))
                return nextNode
            }
        }
        
        // ============================================================================
        // STRATEGY 3: Positional/Fixed Index [LEGACY X.509v1 CERTIFICATES]
        // ============================================================================
        // HOW IT WORKS:
        //   - Uses the fixed position defined in X.509 standard
        //   - Subject is at index 4 (no version) or index 5 (with explicit version)
        //
        // WHY IT WORKS:
        //   - Early X.509 implementations followed strict field ordering
        //   - Index positions:
        //       [0] Version (optional, explicit tag 0xA0)
        //       [1 or 0] Serial Number
        //       [2 or 1] Signature Algorithm
        //       [3 or 2] Issuer
        //       [4 or 3] Validity
        //       [5 or 4] Subject <-- We return this
        //
        // WHEN USED:
        //   - Both Strategy 1 and 2 failed
        //   - Very old X.509v1 certificates (pre-1996)
        //   - Certificates with non-standard but parseable structures
        //
        // EXAMPLE:
        //   If first child has tag 0xA0 (explicit version), Subject is at index 5
        //   Otherwise, Subject is at index 4
        //
        // USAGE: <0.01% of certificates - Historical X.509v1 certificates only
        // ============================================================================
        var idx = (tbsChildren[0] && (tbsChildren[0].tag & 0xe0) === 0xa0) ? 1 : 0  // Skip version if present
        var subjectIdx = idx + 4  // Subject is 4 fields after version/serial
        if (subjectIdx < tbsChildren.length) {
            var candidate = tbsChildren[subjectIdx]
            if (candidate && candidate.tag === 0x30) {
                this._log('findSubjectNode via position at index ' + subjectIdx)
                return candidate
            }
        }
        
        // ============================================================================
        // STRATEGY 4: Heuristic Pattern Matching [LAST RESORT]
        // ============================================================================
        // HOW IT WORKS:
        //   - Analyzes the structure of each SEQUENCE node
        //   - A Name (Subject/Issuer) contains multiple SET nodes
        //   - Returns the SEQUENCE where ≥50% of children are SETs
        //
        // WHY IT WORKS:
        //   - Distinguished Names have this structure:
        //       Name ::= SEQUENCE {
        //         SET { SEQUENCE { OID, value } }  <-- Each attribute is wrapped in SET
        //         SET { SEQUENCE { OID, value } }
        //         ...
        //       }
        //   - Other structures (SPKI, Validity, Extensions) don't have many SETs
        //
        // WHEN USED:
        //   - ALL other strategies failed (extremely rare)
        //   - Certificate is completely non-standard but still parseable
        //   - Proprietary certificate formats or test certificates
        //
        // EXAMPLE:
        //   SEQUENCE (Subject) <-- We detect this as a likely Name
        //     SET { SEQUENCE { OID 2.5.4.3, "example.com" } }  <-- CN attribute
        //     SET { SEQUENCE { OID 2.5.4.10, "Company" } }     <-- O attribute
        //     SET { SEQUENCE { OID 2.5.4.6, "US" } }           <-- C attribute
        //   (3 SETs out of 3 children = 100% ≥ 50% threshold)
        //
        // WARNING: This is a "best guess" approach and may incorrectly identify
        //          Issuer DN as Subject DN if Subject is missing or malformed.
        //
        // USAGE: <0.001% of certificates - Non-standard/proprietary certificates only
        // ============================================================================
        for (var s = 0; s < tbsChildren.length; s++) {
            var node2 = tbsChildren[s]
            if (!node2 || node2.tag !== 0x30) continue
            var kids2 = this._readChildren(bytes, node2)
            if (!kids2 || !kids2.length) continue
            // Count how many children are SETs (tag 0x31)
            var setCount = kids2.filter(function(k) { return k.tag === 0x31; }).length
            // If ≥50% of children are SETs, this is likely a Name structure
            if (setCount > 0 && setCount >= Math.floor(kids2.length / 2)) {
                this._log('findSubjectNode via heuristic at index ' + s)
                return node2
            }
        }
        
        // No strategy succeeded - certificate is too malformed to parse
        return null
    },
    // Returns the value for an attribute OID inside the Subject Name (RDNSequence) only
    getSubjectOidValue: function (pem, oid) {
        try {
            var bytes = this._pemToDer(pem)
            var root = this._readAsn1(bytes, 0)
            if (!root || root.tag !== 0x30) return null
            var tbs = this._readAsn1(bytes, root.start)
            if (!tbs || tbs.tag !== 0x30) return null
            var children = this._readChildren(bytes, tbs)
            if (!children || children.length < 3) return null
            var subject = this._findSubjectNode(bytes, children)
            if (!subject) return null
            
            var rdns = this._readChildren(bytes, subject)
            this._log('getSubjectOidValue rdnsCount=' + (rdns ? rdns.length : 0))
            if (!rdns) return null
            for (var i = 0; i < rdns.length; i++) {
                var rdn = rdns[i]
                if (!rdn || rdn.tag !== 0x31) continue
                var atvs = this._readChildren(bytes, rdn)
                for (var j = 0; j < atvs.length; j++) {
                    var atv = atvs[j]
                    if (!atv || atv.tag !== 0x30) continue
                    var comps = this._readChildren(bytes, atv)
                    if (!comps || comps.length < 2) continue
                    var typeNode = comps[0]
                    var valNode = comps[1]
                    if (typeNode.tag === 0x06) {
                        var got = this._readOID(bytes, typeNode.start, typeNode.len)
                        this._log('getSubjectOidValue saw oid=' + got)
                        if (got === this._normalizeOidString(oid)) {
                            if (this._isStringTag(valNode.tag)) {
                                return this._bytesToDirectoryString(bytes, valNode.tag, valNode.start, valNode.len)
                            } else if (valNode.tag === 0x04) {
                                var inner = bytes.slice(valNode.start, valNode.start + valNode.len)
                                return this._decodeInner(inner)
                            } else {
                                return this._bytesToHex(bytes, valNode.start, valNode.len)
                            }
                        }
                    }
                }
            }
            return null
        } catch (e) {
            this._log('getSubjectOidValue error=' + e)
            return null
        }
    },

    _findOidValue: function (bytes, off, len, oid, depth) {
        if (depth > 64) return null
        var end = off + len
        var pos = off
        var iters = 0
        while (pos < end) {
            if (++iters > 10000) return null
            var n = this._readAsn1(bytes, pos)
            if (!n) break
            // If constructed (bit 6 set), recurse into contents (covers SEQUENCE 0x30, SET 0x31, and context-specific constructed [0..31])
            if ((n.tag & 0x20) === 0x20) {
                var v = this._findOidValue(bytes, n.start, n.len, oid, depth + 1)
                if (v !== null && typeof v !== 'undefined') return v
            } else if (n.tag === 0x04) {
                // OCTET STRING may contain nested DER (e.g., extension values like SubjectAltName). Recurse into its payload.
                var inner = bytes.slice(n.start, n.start + n.len)
                if (inner && inner.length > 0) {
                    var iv = this._findOidValue(inner, 0, inner.length, oid, depth + 1)
                    if (iv !== null && typeof iv !== 'undefined') return iv
                }
            } else if (n.tag === 0x06) {
                var got = this._readOID(bytes, n.start, n.len)
                if (this._debug && got === this._normalizeOidString(oid)) this._log('fallback matched oid=' + got + ' at depth=' + depth)
                if (got === this._normalizeOidString(oid)) {
                    var sib = this._nextNode(bytes, n)
                    if (!sib) return null
                    if (sib.tag === 0x01) {
                        sib = this._nextNode(bytes, sib)
                        if (!sib) return null
                    }
                    if (sib.tag === 0x04) {
                        var inner = bytes.slice(sib.start, sib.start + sib.len)
                        var iv = this._decodeInner(inner)
                        return iv
                    } else if (this._isStringTag(sib.tag)) {
                        return this._bytesToDirectoryString(bytes, sib.tag, sib.start, sib.len)
                    } else {
                        return this._bytesToHex(bytes, sib.start, sib.len)
                    }
                }
            }
            pos = n.end
        }
        return null
    },

    _normalizeOidString: function (oid) {
        var s = String(oid != null ? oid : '').trim()
        // Strip matching surrounding quotes
        if ((s[0] === '"' && s[s.length - 1] === '"') || (s[0] === "'" && s[s.length - 1] === "'")) {
            s = s.slice(1, -1)
        }
        return s
    },

    /**
     * Decodes content from an OCTET STRING that may contain nested ASN.1 structures.
     * 
     * BACKGROUND:
     * In X.509 certificates, some values (especially in extensions) are stored as
     * OCTET STRINGs that contain additional DER-encoded data inside them.
     * 
     * EXAMPLE USE CASE:
     * The UID attribute is sometimes encoded as:
     *   OCTET STRING {
     *     UTF8String "user-id-value"
     *   }
     * 
     * DECODING STRATEGY:
     * Tries to parse the octets as ASN.1:
     *   1. If it's a string tag → decode as string
     *   2. If it's OCTET STRING (0x04) → return as hex (avoid infinite recursion)
     *   3. If it's INTEGER (0x02) → return as hex
     *   4. If parsing fails → return entire content as hex
     * 
     * WHY HEX FALLBACK?
     * If the content isn't recognizable ASN.1, converting to hex ensures we
     * return *something* rather than throwing an error. This is defensive programming.
     * 
     * @param {Array} octets - Byte array from an OCTET STRING's content
     * @returns {string} Decoded value as a string (may be hex for binary data)
     */
    _decodeInner: function (octets) {
        if (!octets || octets.length === 0) return ''
        var n = this._readAsn1(octets, 0)
        if (!n) return this._bytesToHex(octets, 0, octets.length)
        if (this._isStringTag(n.tag)) {
            return this._bytesToDirectoryString(octets, n.tag, n.start, n.len)
        }
        if (n.tag === 0x04) {
            return this._bytesToHex(octets, n.start, n.len)
        }
        if (n.tag === 0x02) {
            return this._bytesToHex(octets, n.start, n.len)
        }
        // All other tags: return as hex
        return this._bytesToHex(octets, 0, octets.length)
    },

    _nextNode: function (bytes, node) {
        var pos = node.end
        if (pos >= bytes.length) return null
        return this._readAsn1(bytes, pos)
    },

    _pemToDer: function (pem) {
        var text = String(pem != null ? pem : '')
        // Extract the first PEM block content between BEGIN/END lines
        var m = text.match(/-----BEGIN [^-]+-----([\s\S]*?)-----END [^-]+-----/)
        var body = (m ? m[1] : text).replace(/[^A-Za-z0-9+/=]/g, '')
        this._log('pem body b64 length=' + body.length)
        return body ? this._base64ToBytes(body) : []
    },

    _b64Lookup: (function() {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var lookup = {};
        for (var i = 0; i < chars.length; i++) {
            lookup[chars.charAt(i)] = i;
        }
        return lookup;
    })(),

    _base64ToBytes: function (b64) {
        // Custom base64 decoder that works without GlideStringUtil
        var str = String(b64 != null ? b64 : '')
        var out = []
        var bits = 0
        var buffer = 0
        
        for (var i = 0; i < str.length; i++) {
            var c = str.charAt(i)
            if (c === '=') break // padding
            
            var value = this._b64Lookup[c]
            if (value === undefined) continue // skip invalid characters
            
            buffer = (buffer << 6) | value
            bits += 6
            
            if (bits >= 8) {
                bits -= 8
                out.push((buffer >> bits) & 0xff)
                buffer &= (1 << bits) - 1
            }
        }
        
        this._log('_base64ToBytes decoded ' + str.length + ' chars to ' + out.length + ' bytes')
        return out
    },

    _bytesToBase64: function (bytes) {
        var chars = bytes.map(function(b) { return b & 0xff; });
        return gs.base64Encode(String.fromCharCode.apply(null, chars));
    },

    _readAsn1: function (bytes, off) {
        if (off >= bytes.length) return null
        var tag = bytes[off]
        var r1 = this._readLength(bytes, off + 1)
        if (!r1) return null
        var len = r1.len
        var hl = r1.hlen
        var start = off + 1 + hl
        var end = start + len
        if (start < 0 || end < start || end > bytes.length) return null
        return { tag: tag, len: len, start: start, end: end }
    },

    _readChildren: function (bytes, node) {
        if (!node) return null
        var res = []
        var pos = node.start
        var end = node.end
        var iters = 0
        while (pos < end) {
            if (++iters > 10000) break
            var n = this._readAsn1(bytes, pos)
            if (!n) break
            res.push(n)
            pos = n.end
        }
        return res
    },

    /**
     * Reads ASN.1 length encoding from the byte stream.
     * 
     * ASN.1 LENGTH ENCODING:
     * Lengths can be encoded in two forms:
     * 
     * SHORT FORM (0-127):
     *   Single byte with bit 8 clear (< 0x80)
     *   Example: 0x05 = length 5
     * 
     * LONG FORM (128+):
     *   First byte: 0x80 | number_of_length_bytes
     *   Following bytes: length as big-endian integer
     * 
     *   Examples:
     *     0x81 0x80       = 128 (1 length byte)
     *     0x82 0x01 0x00  = 256 (2 length bytes)
     *     0x83 0x01 0x00 0x00 = 65536 (3 length bytes)
     * 
     * WHY TWO FORMS?
     * Short form saves space for small lengths (< 128 bytes).
     * Long form supports large structures (up to 4GB with 4 bytes).
     * 
     * CRITICAL: INTEGER OVERFLOW CHECK (len < 0)
     * ============================================
     * JavaScript bitwise operations (<<, |) operate on 32-bit SIGNED integers.
     * This means the valid range is: -2,147,483,648 to 2,147,483,647
     * 
     * WHEN DOES len < 0 OCCUR?
     * When the decoded length is >= 2^31 (2,147,483,648):
     * 
     * Example: ASN.1 encoding [0x84, 0x80, 0x00, 0x00, 0x00]
     *   0x84 = long form, 4 bytes follow
     *   0x80000000 in unsigned = 2,147,483,648 (2GB)
     *   
     *   After bitwise operations:
     *     len = 0
     *     len = (0 << 8) | 0x80 = 0x80
     *     len = (0x80 << 8) | 0x00 = 0x8000
     *     len = (0x8000 << 8) | 0x00 = 0x800000
     *     len = (0x800000 << 8) | 0x00 = 0x80000000
     *   
     *   In 32-bit signed: 0x80000000 = -2,147,483,648 (NEGATIVE!)
     *   len < 0 ✓ Returns null
     * 
     * WHY THIS MATTERS:
     *   - SECURITY: Prevents integer overflow attacks
     *   - PRACTICAL: No real certificate needs > 2GB length
     *   - SAFETY: Protects against malicious/corrupted data
     * 
     * REAL-WORLD:
     *   - Never in valid certificates (largest ~10KB)
     *   - Only in attack payloads or corrupted data
     * 
     * RETURN VALUE:
     *   - len: The decoded length value
     *   - hlen: Header length (how many bytes the length encoding used)
     * 
     * EXAMPLE:
     *   Bytes at offset: [0x82, 0x01, 0x00, ...]
     *   Returns: {len: 256, hlen: 3}
     *            └─ 256 bytes of content
     *            └─ Length encoding used 3 bytes (0x82 + 2 bytes for 256)
     * 
     * ERROR CONDITIONS:
     *   - Offset past end → null
     *   - Indefinite length (0x80) → null (not supported)
     *   - Length bytes > 4 → null (too large)
     *   - Not enough bytes for long form → null
     *   - Length >= 2^31 (negative after overflow) → null (SECURITY)
     * 
     * @param {Array} bytes - DER-encoded bytes
     * @param {number} off - Offset where length encoding starts
     * @returns {Object|null} {len, hlen} or null if invalid
     */
    _readLength: function (bytes, off) {
        if (off >= bytes.length) return null
        var b = bytes[off]
        if (b < 128) return { len: b, hlen: 1 }
        var n = b & 0x7f
        if (n <= 0 || n > 4) return null
        if (off + 1 + n > bytes.length) return null
        var len = 0
        for (var i = 0; i < n; i++) {
            len = (len << 8) | bytes[off + 1 + i]
        }
        // CRITICAL SECURITY CHECK: Detect integer overflow
        // JavaScript bitwise ops use signed 32-bit integers
        // If len >= 2^31, it becomes negative - reject it
        if (len < 0) return null
        return { len: len, hlen: 1 + n }
    },

    _readOID: function (bytes, off, len) {
        if (len <= 0) return ''
        var end = off + len
        var v = bytes[off]
        var a = [Math.floor(v / 40), v % 40]
        var val = 0
        for (var i = off + 1; i < end; i++) {
            var b = bytes[i]
            val = (val << 7) | (b & 0x7f)
            if ((b & 0x80) === 0) {
                a.push(val)
                val = 0
            }
        }
        return a.join('.')
    },

    _bytesToUtf8: function (bytes, off, len) {
        return String.fromCharCode.apply(null, bytes.slice(off, off + len));
    },

    _stringTags: {0x0c: true, 0x12: true, 0x13: true, 0x14: true, 0x16: true, 0x1a: true, 0x1c: true, 0x1e: true},

    _isStringTag: function (tag) {
        // Common ASN.1 string tags: UTF8String(0x0c), PrintableString(0x13), TeletexString/T61(0x14), IA5String(0x16),
        // VisibleString(0x1a), UniversalString(0x1c), BMPString(0x1e), NumericString(0x12)
        return this._stringTags[tag] === true;
    },

    _bytesToDirectoryString: function (bytes, tag, off, len) {
        // Minimal decoding: treat most as ISO-8859-1/ASCII; handle BMPString (UCS-2 BE) specially.
        if (tag === 0x1e) {
            // BMPString: two-byte big-endian UCS-2
            var codes = []
            for (var i = off; i + 1 < off + len; i += 2) {
                codes.push((bytes[i] << 8) | bytes[i + 1])
            }
            return String.fromCharCode.apply(null, codes);
        }
        // For other string types, return as single-byte characters
        return this._bytesToUtf8(bytes, off, len)
    },

    /**
     * Checks whether a specific OID is present in the Extended Key Usage (EKU) extension
     * of a PEM-encoded X.509 certificate.
     *
     * EKU EXTENSION STRUCTURE (RFC 5280 §4.2.1.12):
     *   Extension ::= SEQUENCE {
     *     extnID      OID (2.5.29.37),
     *     critical    BOOLEAN OPTIONAL,
     *     extnValue   OCTET STRING {
     *       SEQUENCE OF KeyPurposeId
     *     }
     *   }
     *   KeyPurposeId ::= OBJECT IDENTIFIER
     *
     * @param {string} pem - PEM-encoded X.509 certificate
     * @param {string} oid - The OID to look for (e.g., '1.3.6.1.4.1.56079.2.2.21.7')
     * @returns {boolean} true if the OID is present in the EKU extension, false otherwise
     */
    hasExtendedKeyUsageOid: function (pem, oid) {
        try {
            var targetOid = this._normalizeOidString(oid)
            this._log('hasExtendedKeyUsageOid start targetOid=' + targetOid)
            var bytes = this._pemToDer(pem)
            var root = this._readAsn1(bytes, 0)
            if (!root || root.tag !== 0x30) return false
            var tbs = this._readAsn1(bytes, root.start)
            if (!tbs || tbs.tag !== 0x30) return false
            var tbsChildren = this._readChildren(bytes, tbs)
            if (!tbsChildren || tbsChildren.length < 3) return false

            // Find the extensions block: context-specific tag [3] (0xA3)
            var extContainer = null
            for (var i = 0; i < tbsChildren.length; i++) {
                if (tbsChildren[i].tag === 0xA3) {
                    extContainer = tbsChildren[i]
                    break
                }
            }
            if (!extContainer) {
                this._log('hasExtendedKeyUsageOid no extensions block found')
                return false
            }

            // Extensions is SEQUENCE OF Extension wrapped inside the [3] container
            var extSeq = this._readAsn1(bytes, extContainer.start)
            if (!extSeq || extSeq.tag !== 0x30) return false
            var extensions = this._readChildren(bytes, extSeq)
            if (!extensions) return false

            // Iterate through extensions to find EKU (OID 2.5.29.37)
            var EKU_OID = '2.5.29.37'
            for (var e = 0; e < extensions.length; e++) {
                var ext = extensions[e]
                if (!ext || ext.tag !== 0x30) continue
                var extParts = this._readChildren(bytes, ext)
                if (!extParts || extParts.length < 2) continue

                // First child must be the extension OID
                var extOidNode = extParts[0]
                if (!extOidNode || extOidNode.tag !== 0x06) continue
                var extOid = this._readOID(bytes, extOidNode.start, extOidNode.len)
                if (extOid !== EKU_OID) continue

                this._log('hasExtendedKeyUsageOid found EKU extension')

                // The extnValue is an OCTET STRING; it may follow an optional BOOLEAN (critical)
                var octetNode = null
                for (var p = 1; p < extParts.length; p++) {
                    if (extParts[p].tag === 0x04) {
                        octetNode = extParts[p]
                        break
                    }
                }
                if (!octetNode) return false

                // Parse the OCTET STRING content as SEQUENCE OF OID
                var innerBytes = bytes.slice(octetNode.start, octetNode.start + octetNode.len)
                var innerSeq = this._readAsn1(innerBytes, 0)
                if (!innerSeq || innerSeq.tag !== 0x30) return false
                var oidNodes = this._readChildren(innerBytes, innerSeq)
                if (!oidNodes) return false

                for (var k = 0; k < oidNodes.length; k++) {
                    if (oidNodes[k].tag !== 0x06) continue
                    var ekuOid = this._readOID(innerBytes, oidNodes[k].start, oidNodes[k].len)
                    this._log('hasExtendedKeyUsageOid checking ekuOid=' + ekuOid)
                    if (ekuOid === targetOid) return true
                }

                return false
            }

            this._log('hasExtendedKeyUsageOid EKU extension not found in certificate')
            return false
        } catch (e) {
            this._log('hasExtendedKeyUsageOid error=' + e)
            return false
        }
    },

    _bytesToHex: function (bytes, off, len) {
        return bytes.slice(off, off + len)
            .map(function(b) { 
                var hex = b.toString(16).toUpperCase();
                return hex.length === 1 ? '0' + hex : hex;
            })
            .join('');
    },

    type: 'PemCertificateParser',
}
