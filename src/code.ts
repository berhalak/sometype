type Value<T> = { value(): T }
type Fun<T> = () => T
type Prom<T> = PromiseLike<T>

export type Some<T> = T | Value<T> | Fun<T> | Prom<T> | Value<Prom<T>> | Fun<Prom<T>>

type LiftedToUnit<T> =
	T extends Prom<infer R> ? R :
	T extends Value<Prom<infer R>> ? R :
	T extends Fun<Prom<infer R>> ? R :
	T extends Value<infer R> ? R :
	T extends Fun<infer R> ? R :
	never;

type IsAsync<T> = T extends Prom<infer R> ? never :
	T extends Value<Prom<infer R>> ? never :
	T extends Fun<Prom<infer R>> ? never : false;

type Async<T> = Prom<T> | Value<Prom<T>> | Fun<Prom<T>>;
type Sync<T> = T | Value<T> | Fun<T>;

type Unwrap<T> = LiftedToUnit<T> extends never ? T : LiftedToUnit<T>;

type RemoveSync<T> = Exclude<T, Sync<Unwrap<T>>>;

type Return<T> = RemoveSync<T> extends never ? Unwrap<T> : Prom<Unwrap<T>>;

const test1: string = {} as any as Return<string>;
const test2: string = {} as any as Return<() => string>;
const test3: string = {} as any as Return<{ value(): string }>;
const test4: Prom<string> = {} as any as Return<Prom<string>>;
const test5: Prom<string> = {} as any as Return<() => Prom<string>>;
const test6: Prom<string> = {} as any as Return<{ value(): Prom<string> }>;
const some1: Prom<string> = {} as any as Return<Some<string>>;




