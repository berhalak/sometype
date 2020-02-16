import { from, Some } from "./index"

function test(name: string, callback: any) {
    return callback().catch(() => {
        console.log("Error");
    })
}

function expect(some: any) {
    return {
        toBe(what: any) {
            if (what != some) {
                throw new Error(`${some} != ${what}`);
            }
        }
    }
}

test('basics', async () => {
    // simple map
    expect(await from("a").map(x => x.toUpperCase())).toBe("A");

    // function use
    function makesUpper(text: Some<string>) {
        return from(text).map(x => x.toUpperCase());
    }

    expect(await makesUpper("a")).toBe("A");
})
