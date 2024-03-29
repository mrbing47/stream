const str = require("str-temp");

function $and(query, cnt = 0) {
	const data = str_processor(query);
	let result = [];

	for (let i of data) {
		const [main, bracket] = i;

		if (!bracket) {
			result.push(main);
			continue;
		}

		let resarr = [main];

		for (let j of bracket) {
			let temparr = [];
			const brackdata = $and(j, ++cnt);
			for (let k of brackdata) {
				for (let l of resarr) {
					let temp = str(l, k);
					temp = temp.string ?? temp;
					temparr.push(temp);
				}
			}

			resarr = temparr;
		}
		result = [...result, ...resarr];
	}
	return result;
}

function str_processor(query) {
	let data = query + "&";
	let bracket = [];
	let main = [];
	let mainstr = "";
	let brktcnt = 0;
	let brktstr = "";
	let brktarr = [];

	for (let i of data) {
		if (i == "(") {
			++brktcnt;
			if (brktcnt == 1) {
				mainstr += "{";
				continue;
			}
		}
		if (i == ")") {
			--brktcnt;
			if (brktcnt == 0) {
				mainstr += "}";
				if (brktstr !== "") {
					brktarr.push(brktstr);
					brktstr = "";
				}
				continue;
			}
		}
		if (i == "&" && brktcnt == 0) {
			main.push(mainstr);
			mainstr = "";
			if (brktarr.length != 0) {
				bracket.push(brktarr);
				brktarr = [];
			}
			continue;
		}

		if (brktcnt == 0) mainstr += i;
		else brktstr += i;
	}

	return main.map((e, i) => (i in bracket ? [e, bracket[i]] : [e]));
}

/*
console.log($and("A(B(Z&X)&C)D(E&F)GH&JK"));
ABZDEGH
ABXDEGH
ABZDFGH
ABXDFGH
ACDEGH
ACDFGH
JK
*/

module.exports = { $and };
