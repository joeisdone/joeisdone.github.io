class EncodedAttribute {
	constructor(myid, name, bit_pos, bit_num, bit_map, readable_map) {
		this.name = name;
		this.id = myid;
		this.bit_map = bit_map;
		this.bit_pos = bit_pos;
		this.bit_num = bit_num;
		this.readable_map = readable_map;
		if (readable_map || bit_map) {
			$.each(readable_map, function(k, v) {
				if (!(k in bit_map)) {
					console.error(k + " in readable_map but not bit_map");
				}
			});
			$.each(bit_map, function(k, v) {
				if (!(k in readable_map)) {
					console.error(k + " in bit_map but not readable_map");
				}
			});		
		}
	}
	
	readable(attr) {
		if (!this.readable_map) return attr;

		if (!(attr in this.readable_map)) {
			console.error("Missing k: " + attr);
		}
		return this.readable_map[attr];
	}
	
	decode(encoded_value) {
		return (encoded_value >>> this['bit_pos']) & ((1 << this['bit_num']) - 1);
	}
	
	matches(encoded_value, attr) {
		if (!this['bit_map']) return true;

		if (!(attr in this['bit_map'])) {
			console.log("Unknown attribute: " + attr);
			return false;
		}
		constected = this['bit_map'][attr];
		return this.decode(encoded_value) == expected;
	}
	
	extract(encoded_value) {
		var found = null;
		var obj = this;
		const decoded = obj.decode(encoded_value);
		if (!obj['bit_map']) return decoded;

		$.each(obj['bit_map'], function (k, v) {
			if (v == decoded) {
				found = k;
				return false;
			}
		}); 
		return found;
	}
	
	extract_readable(encoded_value) {
		const attr = this.extract(encoded_value);
		return attr ? this.readable(attr) : "<none>";
	}
}

const PARTY_ENCODING = new EncodedAttribute('Party', 'Party', 29, 2, {
	'Dem' : 0,
	'Rep' : 1,
	'UNA' : 2
}, {
	'Dem' : 'Democrat',
	'Rep' : 'Republican',
	'UNA' : 'Independent'
});

// The only one initialized as a var array 
const DAYS_ENCODING = new EncodedAttribute('Date', 'Date', 22, 7, null, null);

const METHOD_2024_ENCODING = new EncodedAttribute('Method2024', '2024 Voting Method', 10, 3, {
	'VBM' : 1,
	'IPEV' : 2
}, {
	'VBM' : '2024 Mail voter (VBM)',
	'IPEV' : '2024 In-Person Early voter (IPEV)',
});

const BITMAP_BOOLEAN = {
	'True': 1,
	'False': 0
};

const VOTED_2024_ENCODING = new EncodedAttribute('Voted2024', 'Voted in 2024', 6, 1, BITMAP_BOOLEAN, {
	'True' : 'Voted in 2024',
	'False' : 'Did not vote in 2024'
});


// for debugging
function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}

// for debugging
function dumpRow(encoded) {
	console.log(encoded)
	const p = PARTY_ENCODING.extract_readable(encoded);
	const d = DAYS_ENCODING.extract_readable(encoded);
	//const c = COUNTY_ENCODING.extract_readable(encoded);
	const v24 = METHOD_2024_ENCODING.extract_readable(encoded);
	const d24 = VOTED_2024_ENCODING.extract_readable(encoded);
	
	const debug_str = "decoded: p:" + p + " d:" + d + 
		" v24:" + v24 + " d24:" + d24;
	console.log(debug_str); 
	/*

python3 nv_encoding.py 32622004
1111100011100010110110100
decoded: p:D d:7 v24:MAIL 24:0 r:1
encoded: N/A
p:D d:7 v24:MAIL 24:0 r:1
	*/
}

// county intentionally excluded because we don't want a 100 box checklist.
var encodings = {
};

/** call this on start. */
function initializeEncoded() {
	dumpRow(32622004);
	//dumpRow(1346766968);

	encodings[DAYS_ENCODING['id']] = DAYS_ENCODING;
	encodings[PARTY_ENCODING['id']] = PARTY_ENCODING;
	encodings[METHOD_2024_ENCODING['id']] = METHOD_2024_ENCODING;
	encodings[VOTED_2024_ENCODING['id']] = VOTED_2024_ENCODING;
}

