import { GameCard } from "./game-card";
import { DeckAreaProps } from "@/types/game";

export const DeckArea = ({ gameState, currentPlayerHand, onDrawCard }: DeckAreaProps) => {
  return (
    <div className="flex justify-center items-center py-6">
      <div className="flex items-center space-x-8">
        <div 
          className={`relative transform transition-transform cursor-pointer ${
            gameState.movesRemaining > 0 && !gameState.gameOver && gameState.deck.length > 0 && currentPlayerHand.length < 7
              ? 'hover:scale-110 hover:shadow-xl' 
              : 'opacity-50 cursor-not-allowed'
          }`}
          onClick={onDrawCard}
          title={
            gameState.deck.length === 0 
              ? "Deck is empty" 
              : gameState.movesRemaining <= 0 
                ? "No moves remaining" 
                : gameState.gameOver 
                  ? "Game is over" 
                  : currentPlayerHand.length >= 7
                    ? "Hand is full (maximum 7 cards)"
                    : `Click to draw a card (${gameState.movesRemaining} moves left)`
          }
        >
          <GameCard 
            type="utility" 
            category="PATCH" 
            value={0} 
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-lg backdrop-blur-sm"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm drop-shadow-lg">DECK</span>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
            {gameState.deck.length}
          </div>
          {gameState.movesRemaining > 0 && !gameState.gameOver && gameState.deck.length > 0 && currentPlayerHand.length < 7 && (
            <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg animate-pulse">
              Click to Draw
            </div>
          )}
        </div>
      </div>
    </div>
  );
};