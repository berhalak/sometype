import { from, Some } from "./index"

test('basics', async () => {
	// simple map
	expect(await from("a").map(x => x.toUpperCase())).toBe("A");

	// function use
	function makesUpper(text: Some<string>) {
		return from(text).map(x => x.toUpperCase());
	}

	expect(await makesUpper("a")).toBe("A");

	// decorator with monad
	class UpperMonad {
		constructor(private text: Some<string>) {

		}

		value() {
			return from(this.text)
				.map(x => x.toUpperCase());
		}
	}

	expect(await from("a").map(x => new UpperMonad(x))).toBe("A");

	// raw decoratr
	class Upper {
		constructor(private text: string) {

		}

		value() {
			return this.text.toUpperCase();
		}
	}

	const v = from("a").map(x => new Upper(x));

	expect(v.value()).toBe("A");
})

test('iterables', async () => {
	const promA = "a"

	const mon = from(promA).value();
})