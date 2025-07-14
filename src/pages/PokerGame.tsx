import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface BlindLevel {
  level: number;
  big: number;
  small: number;
}

interface Player {
  id: number;
  name: string;
  avatar?: string;
  isDealer?: boolean;
  isSmallBlind?: boolean;
  isBigBlind?: boolean;
  folded?: boolean;
  chips: number;
}

const stages = ["Pre-Flop", "Flop", "Turn", "River"] as const;
type Stage = typeof stages[number];

export const PokerGame = () => {
  const location = useLocation();

  if (!location.state) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white px-4 text-center">
        <p>Error: No game data found. Please start from the settings screen.</p>
      </div>
    );
  }

  const { players, blindStructure, startingChips } = location.state as {
    players: Player[];
    blindStructure: BlindLevel[];
    startingChips: number;
  };

  const seatPositions = [
    "top-[-5%] left-1/2 -translate-x-1/2",
    "top-[7%] left-[-5%]",
    "top-[45%] left-[-5%] -translate-y-1/2",
    "top-[60%] left-[-5%]",
    "top-[60%] right-[-5%]",
    "top-[45%] right-[-5%] -translate-y-1/2",
    "top-[7%] right-[-5%]",
    "bottom-[-5%] left-1/2 -translate-x-1/2",
  ];

  const [activePlayers, setActivePlayers] = useState<(Player | null)[]>(Array(8).fill(null));
  const [dealerIndex, setDealerIndex] = useState<number>(-1);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [stage, setStage] = useState<Stage>("Pre-Flop");
  const [blindLevelIndex, setBlindLevelIndex] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [pot, setPot] = useState(0);
  const [betsThisRound, setBetsThisRound] = useState<number[]>(Array(8).fill(0));
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [winnerId, setWinnerId] = useState<number | null>(null);

  useEffect(() => {
    if (players.length < 2) return;

    const seats: (Player | null)[] = Array(8).fill(null);
    players.forEach((p, idx) => {
      seats[idx] = {
        ...p,
        folded: false,
        chips: startingChips,
      };
    });

    const initialDealerIdx = 0;
    const sbIdx = (initialDealerIdx + 1) % seats.length;
    const bbIdx = (initialDealerIdx + 2) % seats.length;

    const initialized = seats.map((p, i) => {
      if (!p) return null;
      return {
        ...p,
        isDealer: i === initialDealerIdx,
        isSmallBlind: i === sbIdx,
        isBigBlind: i === bbIdx,
      };
    });

    setActivePlayers(initialized);
    setDealerIndex(initialDealerIdx);
    setCurrentTurn((bbIdx + 1) % seats.length);
    setPot(0);
    setBetsThisRound(Array(8).fill(0));
    setStage("Pre-Flop");
    setBlindLevelIndex(0);
    setRoundNumber(1);
  }, [players, startingChips]);

  const currentPlayer = activePlayers[currentTurn];
  const currentBlind = blindStructure[blindLevelIndex];

  const rotateBlinds = () => {
    const total = activePlayers.length;
    const newDealer = (dealerIndex + 1) % total;
    const newSB = (newDealer + 1) % total;
    const newBB = (newDealer + 2) % total;

    const updated = activePlayers.map((p, i) => {
      if (!p) return null;
      return {
        ...p,
        isDealer: i === newDealer,
        isSmallBlind: i === newSB,
        isBigBlind: i === newBB,
        folded: false,
      };
    });

    setDealerIndex(newDealer);
    setActivePlayers(updated);
    setCurrentTurn((newBB + 1) % total);
    setRoundNumber((prev) => prev + 1);
    setPot(0);
    setBetsThisRound(Array(8).fill(0));
  };

  // Chequea si solo queda 1 jugador activo (no folded)
  const checkIfRoundShouldEnd = () => {
    const activeCount = activePlayers.filter((p) => p && !p.folded).length;
    if (activeCount === 1) {
      // Abrir modal para elegir ganador, pero en este caso es el unico activo
      const winnerIndex = activePlayers.findIndex((p) => p && !p.folded);
      if (winnerIndex !== -1) {
        handleRoundEnd(winnerIndex);
      }
      return true;
    }
    return false;
  };

  // Termina la ronda: abre modal para elegir ganador (si hay más de uno)
  const handleRoundEnd = (autoWinnerIndex?: number) => {
    if (typeof autoWinnerIndex === "number") {
      // Ya hay ganador automático, asignarle el pote y resetear
      const winner = activePlayers[autoWinnerIndex];
      if (!winner) return;
      const updated = activePlayers.map((p, i) => {
        if (!p) return null;
        if (i === autoWinnerIndex) {
          return { ...p, chips: p.chips + pot };
        }
        return p;
      });
      setActivePlayers(updated);
      setPot(0);
      setBetsThisRound(Array(8).fill(0));
      // Rotar dealer y blinds y reiniciar ronda
      rotateBlinds();
      return;
    }
    // Si hay más de un jugador activo abrir modal para elegir ganador
    setIsWinnerModalOpen(true);
  };

  const nextTurn = () => {
    // Chequear si la ronda debe terminar
    if (checkIfRoundShouldEnd()) return;

    let next = currentTurn;
    do {
      next = (next + 1) % activePlayers.length;
    } while (activePlayers[next]?.folded);

    if (next === dealerIndex) {
      const nextStageIndex = stages.indexOf(stage) + 1;
      if (nextStageIndex < stages.length) {
        setStage(stages[nextStageIndex]);
      } else {
        setStage("Pre-Flop");
        setBlindLevelIndex((prev) => Math.min(prev + 1, blindStructure.length - 1));
        handleRoundEnd();
      }
    }
    setCurrentTurn(next);
  };

  const handleAction = (action: "call" | "bet" | "fold", amount?: number) => {
    if (!currentPlayer || currentPlayer.folded) return;

    if (action === "fold") {
      setActivePlayers((prev) =>
        prev.map((p, i) =>
          i === currentTurn && p ? { ...p, folded: true } : p
        )
      );
      nextTurn();
      return;
    }

    if (action === "call") {
      // Pagar la apuesta máxima actual o apostar small blind si nadie apostó aún
      const maxBet = Math.max(...betsThisRound);
      const toCall = maxBet - betsThisRound[currentTurn];
      if (!currentPlayer || currentPlayer.chips < toCall) {
        // No puede pagar el call, hacer fold
        setActivePlayers((prev) =>
          prev.map((p, i) =>
            i === currentTurn && p ? { ...p, folded: true } : p
          )
        );
        nextTurn();
        return;
      }
      setActivePlayers((prev) =>
        prev.map((p, i) =>
          i === currentTurn && p
            ? { ...p, chips: p.chips - toCall }
            : p
        )
      );
      setBetsThisRound((prev) =>
        prev.map((b, i) =>
          i === currentTurn ? b + toCall : b
        )
      );
      setPot((prev) => prev + toCall);
      nextTurn();
      return;
    }

    if (action === "bet" && amount) {
      if (amount > currentPlayer.chips) {
        alert("No tienes suficientes chips para esta apuesta");
        return;
      }
      const maxBet = Math.max(...betsThisRound);
      if (amount < maxBet) {
        alert("La apuesta debe ser igual o mayor que la apuesta máxima actual");
        return;
      }
      setActivePlayers((prev) =>
        prev.map((p, i) =>
          i === currentTurn && p
            ? { ...p, chips: p.chips - amount }
            : p
        )
      );
      setBetsThisRound((prev) =>
        prev.map((b, i) =>
          i === currentTurn ? b + amount : b
        )
      );
      setPot((prev) => prev + amount);
      setIsBetModalOpen(false);
      nextTurn();
      return;
    }
  };

  // Modal para elegir ganador
  const handleWinnerSelect = () => {
    if (winnerId === null) return;
    const winnerIndex = activePlayers.findIndex((p) => p?.id === winnerId);
    if (winnerIndex === -1) return;

    // Sumamos el pote al ganador
    const updated = activePlayers.map((p, i) => {
      if (!p) return null;
      if (i === winnerIndex) {
        return { ...p, chips: p.chips + pot };
      }
      return p;
    });

    setActivePlayers(updated);
    setPot(0);
    setBetsThisRound(Array(8).fill(0));
    setIsWinnerModalOpen(false);
    rotateBlinds();
  };

  return (
    <div className="bg-[var(--bg-color)] min-h-screen text-white relative flex flex-col items-center">
      <div className="flex justify-between items-center mb-6 w-full max-w-lg p-2 bg-[var(--third-color)]">
        <Link to="/poker" className="text-[var(--first-color)]">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">Poker Game</h1>
        <div className="text-[var(--first-color)] text-right text-xs">
          <div>Round: {roundNumber}</div>
          <div>Blinds: {currentBlind.small}/{currentBlind.big}</div>
        </div>
      </div>

      <div className="relative bg-green-800 bg-opacity-90 rounded-[100px] w-[80vw] sm:w-[400px] h-[65vh] max-h-[700px] shadow-inner shadow-black mt-10">
        {/* Stage encima del pot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-24 text-white font-bold text-lg select-none">
          {stage}
        </div>

        {/* Pot en el centro */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-10 bg-yellow-400 text-black px-3 py-1 rounded font-bold select-none">
          Pot: {pot.toLocaleString()}
        </div>

        {activePlayers.map((p, i) => {
          if (!p) return null;
          return (
            <div
              key={p.id}
              className={`absolute ${seatPositions[i]} flex flex-col items-center rounded-lg p-2 shadow-lg text-black select-none transition-border duration-300 ${currentTurn === i && !p.folded ? "border-4 border-yellow-400" : "border border-transparent"}`}
              style={{ minWidth: 100, backgroundColor: "rgba(255,255,255,0.15)" }}
              title={`Chips bet this round: ${betsThisRound[i].toLocaleString()}`}
            >
              <div className="relative">
                {p.avatar && (
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-14 h-14 rounded-full border border-gray-700 object-cover"
                  />
                )}
                {p.isDealer && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    D
                  </div>
                )}
                {p.isSmallBlind && (
                  <div className="absolute -top-2 -right-2 bg-blue-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    S
                  </div>
                )}
                {p.isBigBlind && (
                  <div className="absolute -top-2 -right-2 bg-red-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    B
                  </div>
                )}
              </div>
              <div className="text-sm font-semibold truncate mt-1 w-full text-center" title={p.name}>
                {p.name}
              </div>
              <div className="text-xs font-mono mt-1 w-full text-center">
                Chips: {p.chips.toLocaleString()}
              </div>
              <div className="text-xs font-mono mt-1 w-full text-center text-green-700 font-bold">
                Last Bet: {betsThisRound[i] > 0 ? betsThisRound[i].toLocaleString() : "-"}
              </div>
              {p.folded && (
                <div className="text-red-500 text-xs font-bold mt-1 text-center">
                  Folded
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-center gap-4 mt-6 px-2">
        <button
          onClick={() => {
            // Para el check/call se asume que es call y la lógica cambia en handleAction
            handleAction("call");
          }}
          className="px-6 py-2 bg-green-500 text-black rounded hover:bg-green-600 disabled:opacity-50"
          disabled={!currentPlayer || currentPlayer.folded}
        >
          {/* Texto dinámico entre Call / Check */}
          {(() => {
            const maxBet = Math.max(...betsThisRound);
            if (maxBet === 0) return "Check";
            if (betsThisRound[currentTurn] === maxBet) return "Check";
            return "Call";
          })()}
        </button>
        <button
          onClick={() => setIsBetModalOpen(true)}
          className="px-6 py-2 bg-blue-500 text-black rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={!currentPlayer || currentPlayer.folded}
        >
          Bet
        </button>
        <button
          onClick={() => handleAction("fold")}
          className="px-6 py-2 bg-red-500 text-black rounded hover:bg-red-600 disabled:opacity-50"
          disabled={!currentPlayer || currentPlayer.folded}
        >
          Fold
        </button>
      </div>

      {/* Modal para apostar */}
      <dialog open={isBetModalOpen} className="bg-[var(--bg-color)] rounded p-6 w-72 max-w-full">
        <h3 className="text-white text-lg mb-4">Make a Bet</h3>
        <div className="mb-4">
          <div className="text-white mb-2">Bet Amount: {betAmount.toLocaleString()}</div>
          <input
            type="range"
            min={currentBlind.small}
            max={currentPlayer?.chips || 0}
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <button
            className="bg-gray-600 text-white px-3 py-1 rounded"
            onClick={() => setBetAmount(Math.max(betAmount - currentBlind.small, currentBlind.small))}
          >
            -
          </button>
          <button
            className="bg-gray-600 text-white px-3 py-1 rounded"
            onClick={() => setBetAmount(Math.min(betAmount + currentBlind.small, currentPlayer?.chips || 0))}
          >
            +
          </button>
          <button
            className="bg-gray-600 text-white px-3 py-1 rounded"
            onClick={() => setBetAmount(currentBlind.small)}
          >
            Min
          </button>
          <button
            className="bg-gray-600 text-white px-3 py-1 rounded"
            onClick={() => setBetAmount(currentPlayer?.chips || 0)}
          >
            Max
          </button>
          <button
            className="bg-gray-600 text-white px-3 py-1 rounded"
            onClick={() => setBetAmount(Math.floor(pot / 2))}
          >
            1/2 pot
          </button>
          <button
            className="bg-gray-600 text-white px-3 py-1 rounded"
            onClick={() => setBetAmount(Math.floor(pot / 3))}
          >
            1/3 pot
          </button>
          <button
            className="bg-gray-600 text-white px-3 py-1 rounded"
            onClick={() => setBetAmount(Math.floor((pot * 2) / 3))}
          >
            2/3 pot
          </button>
          <button
            className="bg-gray-600 text-white px-3 py-1 rounded"
            onClick={() => setBetAmount(pot)}
          >
            Pot
          </button>
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => setIsBetModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => {
              if (betAmount < currentBlind.small) {
                alert(`La apuesta debe ser al menos la ciega pequeña (${currentBlind.small})`);
                return;
              }
              if (betAmount > (currentPlayer?.chips || 0)) {
                alert("No tienes suficientes chips");
                return;
              }
              handleAction("bet", betAmount);
            }}
          >
            Confirm
          </button>
        </div>
      </dialog>

      {/* Modal para elegir ganador */}
      <dialog open={isWinnerModalOpen} className="bg-[var(--bg-color)] rounded p-6 w-72 max-w-full">
        <h3 className="text-white text-lg mb-4">Select the Winner</h3>
        <div className="max-h-48 overflow-y-auto mb-4">
          {activePlayers.map((p, i) =>
            p && !p.folded ? (
              <div
                key={p.id}
                className={`cursor-pointer p-2 rounded mb-1 border ${
                  winnerId === p.id ? "border-yellow-400 bg-yellow-900" : "border-transparent"
                }`}
                onClick={() => setWinnerId(p.id)}
              >
                {p.name} (Chips: {p.chips.toLocaleString()})
              </div>
            ) : null
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => setIsWinnerModalOpen(false)}
          >
            Cancel
          </button>
          <button
            disabled={winnerId === null}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleWinnerSelect}
          >
            Confirm
          </button>
        </div>
      </dialog>
    </div>
  );
};
