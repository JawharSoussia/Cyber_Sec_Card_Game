import { GameCard } from "./game-card";
import { PlayerHandProps } from "@/types/game";

export const PlayerHand = ({
  currentPlayerHand,
  gameState,
  targetingMode,
  selectedCard,
  onCardClick,
  onDragStart,
  onDragEnd,
  onCancelTargeting
}: PlayerHandProps) => {
  return (
    <div className="sticky bottom-0 flex justify-center mt-8 mb-4 z-0 pointer-events-none">
      <div className="bg-gradient-to-t from-gray-900/95 to-gray-800/95 backdrop-blur-md rounded-2xl p-4 border border-gray-600/50 shadow-2xl pointer-events-auto w-fit max-w-6xl">
        <h3 className="text-lg font-bold mb-3 text-center text-white z-0">
          Your Hand 
          <span className={`ml-2 text-sm font-normal ${
            currentPlayerHand.length >= 7 ? 'text-red-400' : 
            currentPlayerHand.length >= 6 ? 'text-yellow-400' : 'text-gray-300'
          }`}>
            ({currentPlayerHand.length}/7)
          </span>
          <span className="ml-4 text-sm text-gray-300 font-normal">
            {gameState.currentPlayer === "player1" 
              ? "NPC's turn - waiting..." 
              : targetingMode 
                ? targetingMode.card.type === "attack"
                  ? `Targeting with ${targetingMode.card.type} - Click an enemy server to attack`
                  : `Targeting with ${targetingMode.card.type} - Click your server to heal`
                : currentPlayerHand.length >= 7
                  ? "Hand is full! Play cards to make room"
                  : gameState.movesRemaining > 0 && !gameState.gameOver
                    ? `Click cards to play them (${gameState.movesRemaining} moves left)`
                    : gameState.gameOver
                      ? "Game Over"
                      : "No moves remaining - turn will end automatically"}
          </span>
          {targetingMode && (
            <button 
              className="ml-4 px-2 py-1 bg-red-600 hover:red-700 text-white text-xs rounded transition-colors"
              onClick={onCancelTargeting}
            >
              Cancel
            </button>
          )}
        </h3>
        <div className="flex justify-center items-end overflow-x-hidden max-w-screen-lg z-50 py-4 px-2 relative min-h-[80px]">
          {currentPlayerHand.map((card, index) => (
            <div 
              key={index} 
              className="transform translate-y-1 hover:-translate-y-0.5 hover:scale-100 transition-all duration-200 flex-shrink-0 relative group"
              style={{
                marginLeft: index > 0 ? '-40px' : '0px',
                zIndex: selectedCard === card ? 100 : 50 - index,
                transform: selectedCard === card ? 'translateY(-2px) scale(1.05)' : ''
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.zIndex = '999';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.zIndex = selectedCard === card ? '100' : (50 - index).toString();
              }}
            >
              <GameCard
                {...card}
                isActive={selectedCard === card}
                onClick={() => onCardClick(card)}
                onDragStart={onDragStart(card, true)}
                onDragEnd={onDragEnd}
                className="shadow-lg"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};