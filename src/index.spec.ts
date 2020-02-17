import { map, Some } from "./index"

test('basics', async () => {
	// simple map
	expect(await map("a").to(x => x.toUpperCase())).toBe("A");

	// function use
	function makesUpper(text: Some<string>) {
		return map(text).to(x => x.toUpperCase());
	}

	expect(await makesUpper("a")).toBe("A");

	// decorator with monad
	class UpperMonad {
		constructor(private text: Some<string>) {

		}

		value() {
			return map(this.text)
				.to(x => x.toUpperCase())
		}
	}

	expect(await map("a").to(x => new UpperMonad(x))).toBe("A");

	// raw decoratr
	class Upper {
		constructor(private text: string) {

		}

		value() {
			return this.text.toUpperCase();
		}
	}

	const v = map("a").to(x => new Upper(x));
	const t = await v;
	expect(t).toBe("A");
})