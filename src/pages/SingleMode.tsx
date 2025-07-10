import { useState } from "react";

const players = [{ level: 1, big: 1000, small: 100}];

export const SingleMode = () => {
  const [chips, setChips] = useState('');

  const handleChipsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChips(e.target.value.replace(/\D/, '')); // solo números
  };
  return (
    <div className="bg-[var(--bg-color)] min-h-screen p-4 text-white">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-[var(--first-color)]">Play</h1>
      </div>

      {/* Starting Chips */}
      <div className="flex flex-col items-center mb-10">
        <h2 className="text-2xl mb-4">Starting Chips</h2>
        <div className="flex gap-2 items-center">
          <input
            className="bg-white text-black px-3 py-2 rounded shadow w-24 text-center"
            type="text"
            placeholder="Amount"
            value={chips}
            onChange={handleChipsChange}
          />
          <span className="text-xl">x</span>
          <span className="text-lg">Chips</span>
        </div>
      </div>

      {/* Blind Structure */}
      <div>
        <h2 className="text-xl text-center mb-4">Blind Structure</h2>
        <div className="flex justify-center gap-4 mb-4">
          <button className="text-[var(--first-color)] border border-[var(--first-color)] px-4 py-1 rounded hover:bg-[var(--first-color)] hover:text-black transition">
            Add Level
          </button>
          <button className="text-[var(--first-color)] border border-[var(--first-color)] px-4 py-1 rounded hover:bg-[var(--first-color)] hover:text-black transition">
            Hands
          </button>
        </div>

        {/* Tabla compacta y moderna */}
        <div>
          <table className="min-w-full max-w-xl mx-auto table-auto border-separate border-spacing-x-4 border-spacing-y-2 text-white">
            <thead>
              <tr>
                <th className="px-3 py-1 font-semibold border-b border-gray-500 text-left">
                  Level
                </th>
                <th className="px-3 py-1 font-semibold border-b border-gray-500 text-left">
                  Big
                </th>
                <th className="px-3 py-1 font-semibold border-b border-gray-500 text-left">
                  Small
                </th>
                <th className="px-3 py-1 font-semibold border-b border-gray-500 text-center w-12">
                  Remove
                </th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={index} className="text-sm">
                  <td className="px-1 py-1 text-center">{player.level}</td>
                  <td className="px-1 py-1 text-center">{player.big}</td>
                  <td className="px-1 py-1 text-center">{player.small}</td>
                  <td className="px-1 py-1 w-12 text-center">
                    <button className="text-red-400 hover:text-red-600 font-bold">
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

