import { useState } from "react";
import { PokerTable } from "../components/PokerTable";
import { Link, useNavigate } from "react-router-dom";

export const BJSettings = () => {
  const [chips, setChips] = useState("");
  const [level, setLevel] = useState(2);
  const [players, setPlayers] = useState([{ level: 1, big: 10, small: 5 }]);
  const [tablePlayers, setTablePlayers] = useState<
    {
      id: number;
      name: string;
      avatar?: string;
      isDealer?: boolean;
      isSmallBlind?: boolean;
      isBigBlind?: boolean;
    }[]
  >([]);

  const navigate = useNavigate();

  const handleAddPlayer = (player: {
    id: number;
    name: string;
    avatar?: string;
  }) => {
    setTablePlayers((prev) => [
      ...prev,
      { ...player, isDealer: false, isSmallBlind: false, isBigBlind: false },
    ]);
  };

  const handleSetDealer = (id: number) => {
    setTablePlayers((prev) =>
      prev.map((p) => ({
        ...p,
        isDealer: p.id === id,
      }))
    );
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

  const handleStartGame = () => {
    if (tablePlayers.length >= 2 && chips) {
      navigate("/bj", {
        state: {
          players: tablePlayers,
          blindStructure: players,
          startingChips: Number(chips),
        },
      });
    } else {
      alert("Please add at least 2 players and set starting chips.");
    }
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
      <div className="my-0 py-0">
        <PokerTable
          onAddPlayer={handleAddPlayer}
          tablePlayers={tablePlayers}
          onSetDealer={handleSetDealer}
        />
      </div>

      {/* Botón para iniciar juego */}
      <div className="flex justify-center">
        <button
          onClick={handleStartGame}
          className="bg-[var(--first-color)] text-black font-bold py-2 px-6 rounded hover:bg-opacity-90 transition mb-20"
        >
          Play
        </button>
      </div>
    </div>
  );
};
