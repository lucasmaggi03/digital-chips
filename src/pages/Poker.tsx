import { useState } from "react";
import { PokerTable } from "../components/PokerTable";
import { Link } from "react-router-dom";

export const Poker = () => {
  const [chips, setChips] = useState("");
  const [level, setLevel] = useState(2);
  const [players, setPlayers] = useState([{ level: 1, big: 10, small: 5 }]);
  const [tablePlayers, setTablePlayers] = useState<string[]>([]);

  const handleAddPlayer = (name: string) => {
    if (name.trim()) {
      setTablePlayers((prev) => [...prev, name.trim()]);
    }
  };

  const handleChipsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChips(e.target.value.replace(/\D/, ""));
  };

  const handleAddLevel = () => {
    const last = players[players.length - 1];
    const newLevel = {
      level: level,
      big: last.big * 2,
      small: last.small * 2,
    };
    setPlayers([...players, newLevel]);
    setLevel((prev) => prev + 1);
  };

  const handleInputChange = (
    index: number,
    field: "big" | "small",
    value: string
  ) => {
    const updated = [...players];
    updated[index][field] = Number(value);
    setPlayers(updated);
  };

  const handleRemove = (index: number) => {
    const updated = [...players];
    updated.splice(index, 1);
    setPlayers(updated);
  };

  return (
    <div className="bg-[var(--bg-color)] text-white min-h-screen">
      {/* Header */}
      <div className="flex items-center bg-[var(--third-color)] justify-between p-4 mb-6">
        <Link to="/selectmode" className="text-white text-2xl w-5">
          ←
        </Link>
        <h1 className="text-3xl font-bold text-[var(--first-color)] text-center">
          Play
        </h1>
        <div className="w-5"></div>
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
          <button
            onClick={handleAddLevel}
            className="text-[var(--first-color)] border border-[var(--first-color)] px-4 py-1 rounded hover:bg-[var(--first-color)] hover:text-black transition"
          >
            Add Level
          </button>
          <button className="text-[var(--first-color)] border border-[var(--first-color)] px-4 py-1 rounded hover:bg-[var(--first-color)] hover:text-black transition">
            Hands
          </button>
        </div>

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
                  <td className="px-1 py-1 text-center">
                    <input
                      type="number"
                      className="bg-[var(--first-color)] w-14 text-black rounded-sm text-center"
                      value={player.big}
                      onChange={(e) =>
                        handleInputChange(index, "big", e.target.value)
                      }
                    />
                  </td>
                  <td className="px-1 py-1 text-center">
                    <input
                      type="number"
                      className="bg-[var(--first-color)] w-14 text-black rounded-sm text-center"
                      value={player.small}
                      onChange={(e) =>
                        handleInputChange(index, "small", e.target.value)
                      }
                    />
                  </td>
                  <td className="px-1 py-1 w-12 text-center">
                    <button
                      className="text-red-400 hover:text-red-600 font-bold"
                      onClick={() => handleRemove(index)}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PokerTable recibe la función para agregar jugador */}
          <div className="my-0 py-0">
            <PokerTable onAddPlayer={handleAddPlayer} />
          </div>
        </div>
      </div>

      {/* Play button */}
      <div className="flex justify-center">
        <Link
          to=""
          className="bg-[var(--first-color)] text-black font-bold py-2 px-6 rounded hover:bg-opacity-90 transition mb-20"
        >
          Play
        </Link>
      </div>
    </div>
  );
};
