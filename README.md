# sometype
Monads made simple.

npm install sometype

``` ts

function makeUpper(text : Some<string>){
    return from(text).map(x=> x.toUpperCase());
}

expect(await makeUpper("a")).toBe("A");
expect(await makeUpper(() => "a"))).toBe("A");
expect(await makeUpper(Promise.resolve("a"))).toBe("A");

```

