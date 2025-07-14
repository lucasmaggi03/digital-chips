import { useRef, useState } from "react";

type Player = {
  id: number;
  name: string;
  avatar?: string;
};

type Props = {
  onAddPlayer: (name: string) => void;
};

export const PokerTable = ({ onAddPlayer }: Props) => {
  const [players, setPlayers] = useState<(Player | null)[]>(Array(8).fill(null));
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const avatarOptions = [
    "/avatars/avatar1.jpeg",
    "/avatars/avatar2.jpeg",
    "/avatars/avatar3.jpeg",
    "/avatars/avatar4.jpeg",
  ];

  const handleOpenDialog = (index: number) => {
    setSelectedSeat(index);
    setName("");
    setSelectedAvatar(null);
    dialogRef.current?.showModal();
  };

  const handleConfirm = () => {
    if (selectedSeat !== null && selectedAvatar) {
      const newPlayer: Player = {
        id: Date.now(),
        name: name || `Player ${selectedSeat + 1}`,
        avatar: selectedAvatar,
      };

      const updated = [...players];
      updated[selectedSeat] = newPlayer;
      setPlayers(updated);

      // ✅ Notificar al componente padre
      onAddPlayer(newPlayer.name);

      dialogRef.current?.close();
    }
  };

  const seatPositions = [
    "top-[15%] left-1/2 -translate-x-1/2",
    "top-[25%] left-[15%]",
    "top-[25%] right-[15%]",
    "top-1/2 left-[10%] -translate-y-1/2",
    "top-1/2 right-[10%] -translate-y-1/2",
    "bottom-[25%] left-[15%]",
    "bottom-[25%] right-[15%]",
    "bottom-[15%] left-1/2 -translate-x-1/2",
  ];

  return (
    <div className="flex flex-col items-center w-full overflow-x-hidden p-4">
      <div className="relative w-full h-[500px] max-w-[500px] mx-auto">
        <img
          src="/poker-table.png"
          alt="poker-table"
          className="absolute inset-0 w-full h-full object-contain rotate-90"
        />
        {players.map((player, index) => (
          <div
            key={index}
            className={`absolute ${seatPositions[index]} flex flex-col items-center`}
          >
            {player ? (
              <div className="flex flex-col items-center">
                {player.avatar && (
                  <img
                    src={player.avatar}
                    className="w-10 h-10 rounded-full border mb-1 object-cover"
                    alt="avatar"
                  />
                )}
                <span className="bg-white text-black px-2 py-1 rounded-full text-xs font-semibold shadow whitespace-nowrap">
                  {player.name}
                </span>
              </div>
            ) : (
              <button
                onClick={() => handleOpenDialog(index)}
                className="text-xs px-2 py-1 rounded-full bg-[var(--first-color)] text-black hover:opacity-80 transition"
              >
                Add
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Diálogo */}
      <dialog
        ref={dialogRef}
        className="bg-[var(--second-color)] text-black rounded-md p-6 shadow-lg w-[90%] sm:w-[80%] md:w-[70%] lg:w-[50%] max-w-sm
             fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-none"
      >
        <h2 className="text-lg font-semibold mb-4">Add Player</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Player name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />

          <h2 className="text-sm font-medium">Choose an image</h2>
          <div className="grid grid-cols-2 gap-2">
            {avatarOptions.map((src) => (
              <img
                key={src}
                src={src}
                onClick={() => setSelectedAvatar(src)}
                className={`w-full aspect-square object-cover rounded cursor-pointer border-2 ${
                  selectedAvatar === src
                    ? "border-blue-600"
                    : "border-transparent"
                }`}
                alt="avatar-option"
              />
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => dialogRef.current?.close()}
              className="flex-1 text-sm py-2 rounded border border-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedAvatar}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:bg-gray-400"
            >
              Confirm
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};
