import ButtonsIndex from "../components/ButtonsIndex";

export const IndexPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-color)]">
      <h1 className="text-6xl font-extrabold text-center mb-10 text-[var(--first-color)]">Ludo</h1>
      <div className="grid grid-cols-1 gap-5 place-items-center">
        <ButtonsIndex to="/singlemode" label="Single Mode" />
        <ButtonsIndex to="/room" label="Betting Room" color="bg-green-600 hover:bg-green-700" />
        <ButtonsIndex to="/options" label="Options" color="bg-gray-600 hover:bg-gray-700" />
      </div>
    </div>
  );
};

