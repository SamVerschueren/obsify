import fs from 'fs';
import test from 'ava';
import m from './';

const fixture = cb => setImmediate(() => cb(null, 'unicorn'));
const fixture2 = (x, cb) => setImmediate(() => cb(null, x));
const fixture3 = () => 'rainbow';
const fixture4 = cb => setImmediate(() => {
	cb(null, 'unicorn');
	return 'rainbow';
});

fixture4.meow = cb => setImmediate(() => cb(null, 'unicorn'));

const fixtureModule = {
	method1: fixture,
	method2: fixture,
	method3: fixture3
};

test.cb('main', t => {
	t.is(typeof m(fixture)().subscribe, 'function');
	m(fixture)().subscribe(result => {
		t.is(result, 'unicorn');
		t.end();
	});
});

test.cb('pass argument', t => {
	m(fixture2)('rainbow').subscribe(result => {
		t.is(result, 'rainbow');
		t.end();
	});
});

test.cb('wrap core method', t => {
	m(fs.readFile)('package.json', 'utf8')
		.map(content => JSON.parse(content))
		.subscribe(result => {
			t.is(result.name, 'obsify');
			t.end();
		});
});

test.cb('module support', t => {
	m(fs).readFile('package.json', 'utf8')
		.map(content => JSON.parse(content))
		.subscribe(result => {
			t.is(result.name, 'obsify');
			t.end();
		});
});

test('module support - doesn\'t transform *Sync methods by default', t => {
	t.is(JSON.parse(m(fs).readFileSync('package.json')).name, 'obsify');
});

test('module support - preserves non-function members', t => {
	const module = {
		method: function () {},
		nonMethod: 3
	};

	t.deepEqual(Object.keys(module), Object.keys(m(module)));
});

test('module support - transforms only members in options.include', t => {
	const pModule = m(fixtureModule, {
		include: ['method1', 'method2']
	});

	t.is(typeof pModule.method1().subscribe, 'function');
	t.is(typeof pModule.method2().subscribe, 'function');
	t.not(typeof pModule.method3().subscribe, 'function');
});

test('module support - doesn\'t transform members in options.exclude', t => {
	const pModule = m(fixtureModule, {
		exclude: ['method3']
	});

	t.is(typeof pModule.method1().subscribe, 'function');
	t.is(typeof pModule.method2().subscribe, 'function');
	t.not(typeof pModule.method3().subscribe, 'function');
});

test('module support - options.include over options.exclude', t => {
	const pModule = m(fixtureModule, {
		include: ['method1', 'method2'],
		exclude: ['method2', 'method3']
	});

	t.is(typeof pModule.method1().subscribe, 'function');
	t.is(typeof pModule.method2().subscribe, 'function');
	t.not(typeof pModule.method3().subscribe, 'function');
});

test('module support — function modules', t => {
	const pModule = m(fixture4);

	t.is(typeof pModule().subscribe, 'function');
	t.is(typeof pModule.meow().subscribe, 'function');
});

test('module support — function modules exclusion', t => {
	const pModule = m(fixture4, {
		excludeMain: true
	});

	t.is(typeof pModule.meow().subscribe, 'function');
	t.not(typeof pModule(function () {}).subscribe, 'function');
});
