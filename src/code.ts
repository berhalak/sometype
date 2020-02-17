type Value<T> = { value(): T }
type Fun<T> = () => T
type Prom<T> = PromiseLike<T>

export type Some<T> = T | Value<T> | Fun<T> | Prom<T> | Value<Prom<T>> | Fun<Prom<T>>

type Mod<T> =
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

type Unwrap<T> = Mod<T> extends never ? T : Mod<T>;

type Return<T> =
	HasProm<T> extends never ? Unwrap<T> : HasProm<T>;

type iii = true extends never ? 1 : 2
type ass = IsAsync<string>
type www = Unwrap<string>
type ret = Return<string>
type ttt = Return<Promise<String>>

type zzz = HasProm<string>

type some = Some<string>


type z1 = Unwrap<some>
type z12 = Return<some>

type HasProm<T> = Extract<T, Unwrap<T> | Prom<Unwrap<T>>> extends Unwrap<T> ? never : Prom<Unwrap<T>>;
type testIsSome = HasProm<Some<string>>
type testIsString = HasProm<string>




