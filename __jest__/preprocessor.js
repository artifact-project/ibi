const tsc = require('typescript');
const tsConfig = require('../tsconfig.json');
const {default:txReflector} = require('tx-reflector/src/transformer/transformer');

module.exports = {
	process(src, path) {
		if (path.endsWith('.ts') || path.endsWith('.tsx')) {
			return tsc.transpileModule(src, {
				compilerOptions: tsConfig.compilerOptions,
				fileName: path,
				transformers: {
					before: [
						txReflector,
					],
					after: [],
				},
			}).outputText;
		}

		return src;
	},
};
