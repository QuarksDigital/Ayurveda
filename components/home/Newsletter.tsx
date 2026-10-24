"use client";

import { useState } from "react";

export default function Newsletter() {
  const [done, setDone] = useState(false);

  return (
    <section className="border-t border-line/60 py-24 md:py-32">
      <div className="container-x mx-auto max-w-2xl text-center">
        <h2 className="headline text-4xl md:text-5xl">Seasonal wisdom, in your inbox.</h2>
        <p className="mt-4 text-lg text-muted">Ritucharya guides, dosha tips and early access to new formulations. Plus 10% off your first order.</p>
        {done ? (
          <p className="mt-10 text-lg font-medium text-green">Thanks - you&apos;re on the list.</p>
        ) : (
          <form
            className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              // TODO: POST to /api/newsletter once the email provider is chosen
              setDone(true);
            }}
          >
            <label htmlFor="nl-email" className="sr-only">
              Email address
            </label>
            <input id="nl-email" type="email" required placeholder="Email address" className="field !rounded-full" />
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
