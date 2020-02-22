async function process(chain: any[]): Promise<any> {
	let last = null;
	for (let i = 0; i < chain.length; i++) {
		let self = chain[i];

		if (i == 0) {
			self = await flat(self);
		}

		if (i != 0) {
			self = self(last);
		}

		if (self === null || self === undefined) {
			return null;
		}
		while (typeof self == 'function') {
			self = self();
		}
		last = self;
	}
	return last;
}



export class MonadImpl<T> {
	constructor(protected self: any[]) {

	}

	to<Z>(exp: (item: T) => Z): any {
		return new MonadImpl([...this.self, (x: any) => {
			if (x) return flat(exp(x));
			return x;
		}]);
	}

	map<Z>(exp: (item: T) => Z): any {
		return new MonadImpl([...this.self, (x: any) => {
			if (x) return exp(x);
			return x;
		}]);
	}

	do<Z>(exp: (item: T) => any): any {
		return new MonadImpl([...this.self, (x: any) => {
			if (x) exp(x);
			return x;
		}]);
	}

	catch<Z>(exp: (item: T) => any): any {
		return new CatchImpl(this.self, (x: any) => {
			return exp(x);
		});
	}

	finally<Z>(exp: (item: T) => any): any {
		return new FinalImpl(this.self, (x: any) => {
			return exp(x);
		});
	}

	async eval() {
		return await process(this.self);
	}

	then(ok: (item: T) => any, failed?: (reason: any) => any) {
		return this.eval().then(ok, failed);
	}
}


async function flat(self: any) {
	if (typeof self == 'object' && self) {
		while (self?.then) {
			self = await self
		}
		if (typeof self == 'object' && typeof self?.value == 'function') {
			self = self.value()
		}
		if (typeof self == 'object' && self?.value !== undefined) {
			self = self.value
		}
	}
	return self
}


export class FinalImpl<T> extends MonadImpl<T> {
	constructor(self: any[], private handler: (msg: any) => any) {
		super(self);
	}


	async eval() {
		let result: any = null;
		try {
			result = await process(this.self);
			return result;
		} finally {
			await this.handler(result);
		}
	}
}

export class CatchImpl<T> extends MonadImpl<T> {
	constructor(self: any[], private handler: (msg: any) => any) {
		super(self);
	}


	async eval() {
		try {
			return await process(this.self);
		} catch (e) {
			await this.handler(e);
		}
	}
}