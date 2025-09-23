import { WinPopupProps } from "@/types/game";

export const WinPopup = ({ gameState, onResetGame }: WinPopupProps) => {
  return (
    <div className="fixed inset-0 bg-blur bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="relative bg-gradient-to-br from-emerald-400 to-cyan-500 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border-2 border-white/30">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
            <img src="crown.png" alt="" className="w-9 h-9" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold mb-2 text-center text-white glow-text celebrate-animation">
          {gameState.winner === "player1" ? "Player 1 Wins! " : "Player 2 Wins! "}
        </h2>
        
        <p className="text-lg mb-6 text-center text-white/90 font-medium">
          {gameState.winner === "player1" 
            ? "Player 1 has dominated the servers!" 
            : "Player 2 has secured victory!"}
        </p>
        
        <div className="flex flex-col space-y-4">
          <button
            onClick={onResetGame}
            className="bg-white hover:bg-gray-100 text-emerald-600 font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-emerald-400"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};