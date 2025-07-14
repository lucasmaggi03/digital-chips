import { Link } from "react-router-dom";

export const SelectMode = () => {
  return (
    <>
      <section className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-color)] p-6">
        <h2 className="text-4xl font-bold text-[var(--first-color)] mb-12 select-none">
          Select Mode
        </h2>
        <div className="flex items-center justify-center gap-10">
          <Link
            to="/poker"
            className="flex items-center justify-center w-28 h-28 bg-[var(--second-color)] rounded-3xl shadow-lg text-white text-xl font-semibold uppercase tracking-wide transition-transform transform hover:scale-110 hover:bg-[var(--first-color)] hover:shadow-xl"
          >
            Poker
          </Link>
          <Link
            to="/blackjack"
            className="flex items-center justify-center w-28 h-28 bg-[var(--second-color)] rounded-3xl shadow-lg text-white text-xl font-semibold uppercase tracking-wide transition-transform transform hover:scale-110 hover:bg-[var(--first-color)] hover:shadow-xl"
          >
            BlackJack
          </Link>
        </div>
      </section>
    </>
  );
};
