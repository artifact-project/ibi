const R_PARSE_FN = /^function\s*\(([^\)]+)\)\s*\{([\s\S]+)\}/;
const R_ARGS_SEPARATOR = /,\s+/;

export interface TXRule<I, K extends keyof I, A> {
	(prop: K, value: I[K], dst: A, src: I, ...args): void;
}

export interface TXRules<I, A> {
	[propName: string]: true | TXRule<I, keyof I, A>;
}

function jit(source: string, prop: string, args: string[]): string {
	const [, argsStr, body] = source.match(R_PARSE_FN);
	const argsNames = argsStr.trim().split(R_ARGS_SEPARATOR);
	let code = body;

	if (argsNames.length) {
		const propVar = argsNames[0];

		code = code
				.replace(new RegExp(`\\[\\b${propVar}\\b\\]`, 'g'), `.${prop}`)
				.replace(new RegExp(`([\\(\\[ ])${propVar}([ \\]\\)])`, 'g'), `$1'${prop}'$2`)
		;

		if (argsNames.length > 1) {
			const valueVar = argsNames[1];

			code = code.replace(RegExp(`(\\s|[!+-]|\\()(${valueVar})(\\.|\\s|;|\\))`, 'g'), `$1${args[1]}.${prop}$3`);

			if (argsNames.length > 2) {
				argsNames.slice(2).forEach((name, idx) => {
					if (args[idx] !== name) {
						code = `var ${name} = ${args[idx]};\n${code}`;
					}
				});

				// code = code.replace(new RegExp(`\\b${argsNames[2]}\\b(\\.|\\[)`, 'g'), `${args[0]}$1`);
			}
		}
	}

	return `// Inline: ${prop}\n${code}`;
}

export function createDeclarationFactory<A>(args: string[], defaultRule: (prop: string, rule: any, dst: A, src) => void) {
	const entries = {};

	return {
		create<I>(name: string, rules: TXRules<I, A>): (dst: Partial<A>, src: I, ...others) => Partial<A> {
			const source = [];

			Object.keys(rules).forEach(prop => {
				let rule = rules[prop];

				if (rule === true) {
					rule = defaultRule;
				}

				source.push(jit(rule.toString(), prop, args));
			});

			source.push(`return ${args[0]};`);
			entries[name] = Function(`return function ${name}(${args.join(', ')}) {\n${source.join('\n')}\n}`)();

			return entries[name];
		},

		exec(interfaces: string[], dst: Partial<A>, ...others): Partial<A> {
			let idx = interfaces.length;

			while (idx--) {
				const name = interfaces[idx];

				if (entries.hasOwnProperty(name)) {
					entries[name](dst, ...others);
				} else {
					console.warn(`createGenerator().exec: ${name} not register`);
				}
			}

			return dst;
		}
	};
}
