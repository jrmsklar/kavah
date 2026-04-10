"use client";

export function AboutYouStep({
  isExistingUser,
  birthday,
  setBirthday,
  heightInches,
  setHeightInches,
  city,
  setCity,
  onNext,
}: {
  isExistingUser: boolean;
  birthday: string;
  setBirthday: (v: string) => void;
  heightInches: number | null;
  setHeightInches: (v: number | null) => void;
  city: string;
  setCity: (v: string) => void;
  onNext: () => void;
}) {
  const canProceed = birthday && heightInches !== null && city.trim();

  const inputClass =
    "mt-1.5 block w-full rounded-lg border border-border bg-warm px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold disabled:bg-cream disabled:text-ink-3";

  return (
    <div className="px-6 pb-12">
      <div className="max-w-md mx-auto w-full">
        <h1 className="font-serif text-2xl font-medium text-ink">
          {isExistingUser ? "Confirm your info" : "Tell us about yourself"}
        </h1>
        <p className="mt-1.5 text-sm text-ink-2">
          {isExistingUser
            ? "We found your account. Confirm your details to continue."
            : "We just need a few basics to get you started."}
        </p>

        <div className="mt-8 space-y-5">
          {/* Birthday */}
          <div>
            <label htmlFor="birthday" className="block text-xs font-medium text-ink-2 uppercase tracking-wide">
              Birthday
            </label>
            <input
              id="birthday"
              type="date"
              required
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className={`${inputClass} min-w-0 appearance-none`}
            />
          </div>

          {/* Height & City row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="height" className="block text-xs font-medium text-ink-2 uppercase tracking-wide">
                Height
              </label>
              <select
                id="height"
                required
                value={heightInches ?? ""}
                onChange={(e) => setHeightInches(e.target.value ? Number(e.target.value) : null)}
                className={inputClass}
              >
                <option value="">Select</option>
                {Array.from({ length: 37 }, (_, i) => 48 + i).map((inches) => {
                  const ft = Math.floor(inches / 12);
                  const rem = inches % 12;
                  return (
                    <option key={inches} value={inches}>
                      {ft}&apos;{rem}&quot;
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label htmlFor="city" className="block text-xs font-medium text-ink-2 uppercase tracking-wide">
                City
              </label>
              <select
                id="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
              >
                <option value="">Select</option>
                <option value="Austin, TX">Austin, TX</option>
                <option value="Boston, MA">Boston, MA</option>
                <option value="Chicago, IL">Chicago, IL</option>
                <option value="Los Angeles, CA">Los Angeles, CA</option>
                <option value="Miami, FL">Miami, FL</option>
                <option value="New York, NY">New York, NY</option>
                <option value="San Francisco, CA">San Francisco, CA</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className="mt-8 w-full rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-white hover:bg-ink/90 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
