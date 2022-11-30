const difference = (a, b, cb = (x) => x) => {
	a = new Set(a);
	b = new Set(b.map((ele) => cb(ele).toUpperCase()));
	return [...a].filter((x) => !b.has(x.toUpperCase()));
};

const intersection = (a, b, cb = (x) => x) => {
	a = new Set(a);
	b = new Set(b.map((ele) => cb(ele).toUpperCase()));
	return [...a].filter((x) => b.has(x.toUpperCase()));
};

module.exports = {
	difference,
	intersection,
};
