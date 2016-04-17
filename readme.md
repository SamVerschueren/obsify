# obsify [![Build Status](https://travis-ci.org/SamVerschueren/obsify.svg?branch=master)](https://travis-ci.org/SamVerschueren/obsify)

> Observableify a callback-style function


## Install

```
$ npm install --save obsify
```


## Usage

```js
const fs = require('fs');
const obsify = require('obsify');

obsify(fs.readFile)('package.json', 'utf8')
	.map(data => JSON.parse(data))
	.subscribe(data => {
		console.log(data.name);
		//=> 'obsify'
	});

// or observableify all methods in a module

obsify(fs).readFile('package.json', 'utf8')
	.map(data => JSON.parse(data))
	.subscribe(data => {
		console.log(data.name);
		//=> 'obsify'
	});
```


## API

### obsify(input, [options])

#### input

Type: `function`, `object`

Callback-style function or module whose methods you want to observableify.


#### options

##### include

Type: `array` of (`string`|`regex`)

Methods in a module to observableify. Remaining methods will be left untouched.

##### exclude

Type: `array` of (`string`|`regex`)<br>
Default: `[/.+Sync$/]`

Methods in a module **not** to observableify. Methods with names ending with `'Sync'` are excluded by default.

##### excludeMain

Type: `boolean`<br>
Default: `false`

By default, if given module is a function itself, this function will be observableified. Turn this option on if you want to observableify only methods of the module.

```js
const obsify = require('obsify');

function fn() {
    return true;
}

fn.method = (data, callback) => {
    setImmediate(() => {
        callback(data, null);
    });
};

// observableify methods but not fn()
const observableFn = obsify(fn, {excludeMain: true});

if (observableFn()) {
    observableFn.method('hi').subscribe(data => {
        console.log(data);
    });
}
```


## License

MIT © [Sam Verschueren](https://github.com/SamVerschueren)
