import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import clsx from "clsx";

interface Player {
  id: number;
  name: string;
  avatar?: string;
  isDealer?: boolean;
  chips: number;
  bet?: number;
  status?: "waiting" | "stand" | "double" | "split" | "blackjack" | "lose";
  hasActed?: boolean;
  handValue?: number; // valor de la mano, para decidir ganador
  dealerHandValue?: number;
}

export const BJ = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { players, startingChips }: { players: Player[]; startingChips: number } =
    location.state || {};

  const [playerList, setPlayerList] = useState<Player[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<"betting" | "playing" | "finished">(
    "betting"
  );

  useEffect(() => {
    if (!players || !startingChips) {
      navigate("/bjsettings");
      return;
    }

    const initialized = players.map((p) => ({
      ...p,
      chips: startingChips,
      bet: 0,
      status: "waiting",
      hasActed: false,
      handValue: 0,
      dealerHandValue: 0,
    }));

    setPlayerList(initialized);
  }, [players, startingChips, navigate]);

  const isDealer = (p: Player) => p?.isDealer;

  const allPlayersBet = playerList
    .filter((p) => !isDealer(p))
    .every((p) => p.bet && p.bet > 0);

  const handleBetChange = (i: number, value: number) => {
    if (value < 0) return;
    const updated = [...playerList];
    // No puede apostar más fichas de las que tiene
    if (value > updated[i].chips) value = updated[i].chips;
    updated[i].bet = value;
    setPlayerList(updated);
  };

  const startGame = () => {
    const first = playerList.findIndex((p) => !isDealer(p));
    setCurrentTurn(first);
    setGamePhase("playing");

    // Simulamos que dealer tiene mano fija (por ejemplo 17)
    const updated = [...playerList];
    updated.forEach((p) => {
      if (p.isDealer) {
        p.handValue = 17; // fijo por reglas del enunciado
      } else {
        p.handValue = 18 + Math.floor(Math.random() * 5); // simulamos mano jugador (18-22)
      }
    });
    setPlayerList(updated);
  };

  const handleAction = (action: Player["status"]) => {
    if (currentTurn === null) return;

    const updated = [...playerList];
    const current = updated[currentTurn];

    if (current.hasActed) return; // solo una acción permitida

    // Validar si tiene fichas suficientes para acciones que doblan apuesta o split
    const bet = current.bet || 0;

    switch (action) {
      case "double":
        if (bet * 2 > current.chips + bet) {
          alert("No tienes fichas suficientes para doblar.");
          return;
        }
        current.bet = bet * 2;
        current.chips -= bet; // se descuenta la diferencia
        break;
      case "split":
        if (bet > current.chips) {
          alert("No tienes fichas suficientes para split.");
          return;
        }
        current.chips -= bet;
        break;
      case "lose":
        // No se modifica chips aquí, se resta después al resolver ronda
        break;
      case "blackjack":
        // No se modifica chips aquí, se paga después al resolver ronda
        break;
      case "stand":
        // Sin cambio en chips
        break;
    }

    current.status = action;
    current.hasActed = true;

    // Avanzar al siguiente jugador que no sea dealer
    let next = currentTurn + 1;
    while (next < updated.length && isDealer(updated[next])) next++;
    if (next >= updated.length) {
      setGamePhase("finished");
      setCurrentTurn(null);
    } else {
      setCurrentTurn(next);
    }
    setPlayerList(updated);
  };

  // Resolver resultados basados en estado y comparación de manos
  const resolveRound = () => {
    const updated = [...playerList];
    const dealer = updated.find((p) => p.isDealer);

    if (!dealer) return;

    updated.forEach((p) => {
      if (!p.isDealer) {
        const bet = p.bet || 0;
        const playerHV = p.handValue || 0;
        const dealerHV = dealer.handValue || 0;

        if (p.status === "blackjack") {
          // Paga 3:2
          p.chips += bet * 1.5;
        } else if (
          p.status === "stand" ||
          p.status === "double" ||
          p.status === "split"
        ) {
          if (playerHV > 21) {
            // Se pasó, pierde
            p.chips -= bet;
            p.status = "lose";
          } else if (dealerHV > 21) {
            // Dealer se pasó, gana jugador
            p.chips += bet;
          } else if (playerHV > dealerHV) {
            // Jugador gana, paga 2:1
            p.chips += bet;
          } else {
            // Jugador pierde
            p.chips -= bet;
            p.status = "lose";
          }
        } else if (p.status === "lose") {
          p.chips -= bet;
        }
        if (p.chips < 0) p.chips = 0; // No puede tener chips negativos
      }
    });

    setPlayerList(updated);
  };

  const restart = () => {
    const reset = playerList.map((p) => ({
      ...p,
      bet: 0,
      status: "waiting",
      hasActed: false,
      handValue: 0,
    }));
    setPlayerList(reset);
    setGamePhase("betting");
    setCurrentTurn(null);
  };

  // Posiciones para colocar jugadores en la mesa (usamos Tailwind utilities)
  const tablePositions = [
    "bottom-6 left-1/2 -translate-x-1/2", // Bottom center
    "bottom-16 left-1/4", // Bottom left
    "bottom-16 right-1/4", // Bottom right
    "bottom-32 left-10", // Left bottom
    "bottom-32 right-10", // Right bottom
    "top-16 left-1/2 -translate-x-1/2", // Dealer (top center)
  ];

  return (
    <div className="bg-[var(--bg-color)] text-white min-h-screen p-6 relative">
      <h1 className="text-3xl font-bold text-center text-[var(--first-color)] mb-8">
        Blackjack Table
      </h1>

      <div className="relative w-full h-[480px] max-w-6xl mx-auto bg-green-900 rounded-full border-8 border-yellow-600">
        {playerList.map((p, i) => (
          <div
            key={p.id}
            className={clsx(
              "absolute w-28 h-24 bg-white/10 rounded-lg border p-2 text-center flex flex-col items-center justify-center",
              tablePositions[i],
              currentTurn === i && gamePhase === "playing" && "ring-4 ring-green-400",
              p.isDealer && "bg-yellow-800 border-yellow-400"
            )}
          >
            <img
              src={p.avatar || "/avatars/avatar1.jpeg"}
              alt="avatar"
              className="w-10 h-10 rounded-full mb-1 object-cover border border-white"
            />
            <div className="font-bold text-sm truncate w-full">{p.name}</div>
            {p.isDealer && (
              <div className="text-yellow-300 text-xs font-semibold mt-0.5">
                Dealer
              </div>
            )}
            <div className="text-xs mt-1">💰 {p.chips}</div>
            <div className="text-xs mt-1">
              🎯 Bet:{" "}
              {gamePhase === "betting" && !p.isDealer ? (
                <input
                  type="number"
                  className="w-14 text-center text-black rounded"
                  min={0}
                  max={p.chips}
                  value={p.bet || ""}
                  onChange={(e) => handleBetChange(i, Number(e.target.value))}
                />
              ) : (
                p.bet
              )}
            </div>
            {p.status !== "waiting" && (
              <div className="text-xs mt-1 text-gray-300">{p.status}</div>
            )}

            {/* Animación carta dada vuelta */}
            {gamePhase !== "betting" && (
              <div
                className="w-12 h-16 bg-blue-700 rounded shadow-lg mt-2 cursor-pointer animate-flip"
                title="Carta dada vuelta"
              ></div>
            )}
          </div>
        ))}
      </div>

      {gamePhase === "betting" && (
        <div className="text-center mt-6">
          <button
            onClick={startGame}
            disabled={!allPlayersBet}
            className="bg-[var(--first-color)] text-black font-bold px-6 py-2 rounded disabled:bg-gray-600"
          >
            Comenzar juego
          </button>
        </div>
      )}

      {gamePhase === "playing" && currentTurn !== null && (
        <div className="text-center mt-6">
          <h2 className="text-xl mb-2">Turno de: {playerList[currentTurn].name}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => handleAction("stand")}
              className="bg-blue-500 px-4 py-2 rounded"
            >
              Stand
            </button>
            <button
              onClick={() => handleAction("double")}
              className="bg-purple-600 px-4 py-2 rounded"
            >
              Double
            </button>
            <button
              onClick={() => handleAction("split")}
              className="bg-yellow-400 text-black px-4 py-2 rounded"
            >
              Split
            </button>
            <button
              onClick={() => handleAction("blackjack")}
              className="bg-green-500 px-4 py-2 rounded"
            >
              Blackjack
            </button>
            <button
              onClick={() => handleAction("lose")}
              className="bg-red-500 px-4 py-2 rounded"
            >
              Lose
            </button>
          </div>
        </div>
      )}

      {gamePhase === "finished" && (
        <div className="text-center mt-10">
          <h2 className="text-2xl font-bold mb-4">Fin de ronda</h2>
          <button
            onClick={resolveRound}
            className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded"
          >
            Resolver Ganadores
          </button>
          <button
            onClick={restart}
            className="ml-4 bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded"
          >
            Nueva ronda
          </button>
        </div>
      )}
    </div>
  );
};
