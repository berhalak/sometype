import { MonadImpl } from "./impl"

type Value<T> = { value(): T }
type Fun<T> = () => T
type Prom<T> = PromiseLike<T>

type Mod<T> = Value<T> | Fun<T>
type Unit<T> = T | Prom<T> | Monad<T>

export type Some<T> = Unit<T> | Mod<Unit<T>>


type Type<T> =
	T extends Monad<Some<infer R>> ? R :
	T extends Prom<Some<infer R>> ? R :
	T extends Value<Some<infer R>> ? R :
	T extends Fun<Some<infer R>> ? R :
	T extends Some<infer R> ? R :
	never;

const test1: string = {} as any as Type<string>;
const test2: string = {} as any as Type<() => string>;
const test3: string = {} as any as Type<{ value(): string }>;
const test4: string = {} as any as Type<Prom<string>>;
const test5: string = {} as any as Type<() => Prom<string>>;
const test6: string = {} as any as Type<{ value(): Prom<string> }>;
const some1: string = {} as any as Type<Some<string>>;
const mona1: string = {} as any as Type<Monad<string>>;
const mona2: string = {} as any as Type<Monad<Some<string>>>;


export type Monad<T> = {
	to<Z>(bind: (item: T) => Z): Monad<Type<Z>>
	map<Z>(bind: (item: T) => Z): Monad<Z>
	catch(bind: (item: any) => any): Monad<T>
	finally(bind: (item: T) => any): Monad<T>
	do(action: (item: T) => any): Monad<T>
	then<Z>(ok: (item: T) => Z, fail: (reason: any) => any): Monad<Type<Z>>;
}


export function map<T>(item: T): Monad<Type<T>> {
	return new MonadImpl([item]) as any;
}