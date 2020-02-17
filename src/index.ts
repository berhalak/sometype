type Value<T> = { value(): T }
type Fun<T> = () => T
type Prom<T> = PromiseLike<T>

export type Some<T> = T | Value<T> | Fun<T> | Prom<T> | Value<Prom<T>> | Fun<Prom<T>> | Monad<T>

type Return<T> =
	T extends Monad<Some<infer R>> ? R :
	T extends Prom<Some<infer R>> ? R :
	T extends Value<Some<infer R>> ? R :
	T extends Fun<Some<infer R>> ? R :
	T extends Some<infer R> ? R :
	never;

const test1: string = {} as any as Return<string>;
const test2: string = {} as any as Return<() => string>;
const test3: string = {} as any as Return<{ value(): string }>;
const test4: string = {} as any as Return<Prom<string>>;
const test5: string = {} as any as Return<() => Prom<string>>;
const test6: string = {} as any as Return<{ value(): Prom<string> }>;
const some1: string = {} as any as Return<Some<string>>;
const mona1: string = {} as any as Return<Monad<string>>;
const mona2: string = {} as any as Return<Monad<Some<string>>>;


export type Monad<T> = {
	to<Z>(bind: (item: T) => Z): Monad<Return<Z>>
	then<Z>(ok: (item: T) => Z, fail: (reason: any) => any): Monad<Return<Z>>;
}

export type From<T> = {
	where(selector: (item: T) => boolean): From<T>;
	map<Z>(selector: (item: T) => Z): From<Z>;
	first(selector?: (item: T) => boolean): T;
	count(): number;
}

export function map<T>(item: T):
	T extends Iterable<infer R> ? T extends string ? Monad<Return<T>> : From<R> :
	Monad<Return<T>> {
	return new MonadImpl([item]) as any;
}

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

	to<Z>(exp: (item: T) => Z): any {
		return new MonadImpl([...this.self, exp]);
	}

	async eval() {
		return await process(this.self);
	}

	then(ok: (item: T) => any, failed?: (reason: any) => any) {
		return this.eval().then(ok, failed);
	}
}
