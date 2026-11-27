# Trip Splitter

A small React + TypeScript app for recording shared trip expenses, choosing a split, and seeing member balances. Expenses are saved in browser local storage.

## Run it

```sh
git clone https://github.com/CodeByG14/Trip_Splitter.git
cd Trip_Splitter
npm install
npm run dev
```

Other checks: `npm run build`, `npm run typecheck`, `npm run lint`, and `npm run test`.

**Live demo:** [trip-splitter-wine.vercel.app](https://trip-splitter-wine.vercel.app)

The expense form, validation, split options, listing, filters, balances, deletion, and browser persistence are implemented. The "Expense added" notice is carried in router state and may reappear if the Expenses page is reloaded. Member editing is intentionally out of scope; update the bundled member list before starting a trip.

## Three decisions and why

1. **Integer paise for money:** parsing and calculations use whole paise to avoid floating-point rounding errors. For equal and percentage splits, each share is floored, then leftover paise go one each to the first participants in members-list order.
2. **One persistence boundary:** a single store subscription writes expenses to local storage. A shared type guard validates both browser data and bundled JSON, keeping storage concerns out of components.
3. **String form state and pure validation:** all entered values stay as strings in one form state object. One pure validation function reports errors and converts valid input to typed expense data on Save.

## What I would improve with another day

Add a member-management screen, provide a more detailed balance settlement view, and run browser-based accessibility checks with keyboard and screen-reader testing.

## How I used AI tools

- I read the problem statement myself first, then shared it with an AI assistant and discussed it until we both had the same understanding of the logic, the tech stack and how everything would work.
- I then settled the finer details of the code structure and style so it matches how I understand and write code.
- I had the AI generate a skeleton that forms the backbone of the project, then reviewed it and corrected anything that looked wrong.
- I built on top of that code and kept track of what was covered until the project was complete.
