
type Fun<T> = () => T;
type Value<T> = { value(): T };

export type Some<T> = T | PromiseLike<T> | Fun<T> | Fun<PromiseLike<T>> | Value<T> | Value<PromiseLike<T>>;

type PromToUnit<T> = T extends PromiseLike<infer R> ? R : T;

type Monad<T> = {
	then<Z>(exp: (item: PromToUnit<T>) => Z, failed?: (reason: any) => any): From<T, Z>
	map<Z>(exp: (item: PromToUnit<T>) => Z): From<T, Z>;
	ifNull<Z>(exp: (item: PromToUnit<T>) => Z): From<T, Z>;
	value(): T;
}

type From<T, Z> = T extends PromiseLike<infer R> ? Monad<PromiseLike<SomeToVal<Z>>> : Monad<SomeToVal<Z>>;

async function process(chain: any[]): Promise<any> {
	let last = null;
	for (let i = 0; i < chain.length; i++) {
		let self = chain[i];

		if (i != 0) {
			self = self(last);
		}

		if (self === null || self === undefined) {
			return null;
		}
		while (typeof self == 'function') {
			self = self();
		}
		if (typeof self == 'object') {
			while (self.then) {
				self = await self;
			}

			if (typeof self == 'object' && typeof self.value == 'function') {
				self = self.value();
			}
			if (typeof self == 'object' && self.value !== undefined) {
				self = self.value;
			}
		}
		last = self;
	}
	return last;
}

class MonadImpl<T> {
	constructor(private self: any[]) {

	}

	map<Z>(exp: (item: T) => Z): any {
		return new MonadImpl([...this.self, exp]);
	}

	async eval() {
		return await process(this.self);
	}

	then(ok: (item: T) => any, failed?: (reason: any) => any) {
		return this.eval().then(ok, failed);
	}
}


type SomeToVal<T> =
	T extends PromiseLike<infer R> ? PromiseLike<R> :
	T extends Fun<infer R> ? R :
	T extends Value<infer R> ? R :
	T

type PickMonad<T> = T extends Some<infer R> ?
	R extends PromiseLike<infer Z> ? Monad<PromiseLike<Z>> : never
	: never;

export function from<T>(item: T): PickMonad<T> {
	return {} as any;
}

function test(ww: Some<string>) {
	return from(ww).value();
}