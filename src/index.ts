type Monad<T> = {
    then<Z>(exp: (item: T) => Z, failed?: (reason: any) => any): PickMonad<Z>
    map<Z>(exp: (item: T) => Z): PickMonad<Z>;
    ifNull<Z>(exp: (item: T) => Z): PickMonad<Z>;
    // where(filter: (item: PickElement<T>) => boolean): Monad<T>;
    // select<Z>(filter: (item: PickElement<T>) => Z): Monad<Array<Z>>;
    // first(filter?: (item: PickElement<T>) => boolean): Monad<PickElement<T>>;
}

type PickElement<T> = T extends Array<infer R> ? R : never;
type Value<T> = { value(): T }
type Fun<T> = () => T;
type Flat<T> = T extends Monad<infer R> ? R : T;
export type Some<T> = T | Value<T> | Fun<T> | Monad<T>;

type PickMonad<T> =
    T extends Monad<infer R> ? Monad<Flat<R>> :
    T extends Value<infer R> ? Monad<Flat<R>> :
    T extends Promise<infer R> ? Monad<Flat<R>> :
    T extends Fun<infer R> ? Monad<Flat<R>> :
    Monad<T>;


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

class From<T> {
    constructor(private self: any[]) {

    }

    map<Z>(exp: (item: T) => Z): any {
        return new From([...this.self, exp]);
    }

    async eval() {
        return await process(this.self);
    }

    then(ok: (item: T) => any, failed?: (reason: any) => any) {
        return this.eval().then(ok, failed);
    }
}

function from<T>(item: T): PickMonad<T> {
    return new From([item]) as any;
}


export {
    from
}