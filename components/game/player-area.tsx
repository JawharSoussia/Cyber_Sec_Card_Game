import { forwardRef } from "react";
import { GameCard } from "./game-card";
import { PlayerAreaProps } from "@/types/game";

export const PlayerArea = forwardRef<HTMLDivElement, PlayerAreaProps>(({
  player,
  gameState,
  defenseLayer,
  defenseHealth,
  targetingMode,
  selectedDefenseCard,
  onDefenseCardDrop,
  onSPVClick,
  onDefenseCardPlace
}, ref) => {
  const isPlayer2 = player === "player2";
  const playerName = isPlayer2 ? "Player 2 (You)" : "Player 1 (NPC)";
  const playerColor = isPlayer2 ? "red" : "blue";
  const spvValues = isPlayer2 ? gameState.player2SPV : gameState.player1SPV;
  
  // Determine gradient classes based on player
  const gradientClass = isPlayer2 
    ? "bg-gradient-to-t from-red-100/80 to-red-200/80 border-red-300/50" 
    : "bg-gradient-to-b from-blue-100/80 to-blue-200/80 border-blue-300/50";
  
  const textColorClass = isPlayer2 ? "text-red-800" : "text-blue-800";
  const defenseBorderClass = isPlayer2 ? "border-red-300/50" : "border-blue-300/50";
  const defenseTextClass = isPlayer2 ? "text-red-400" : "text-blue-400";
  const healthBadgeClass = isPlayer2 ? "bg-red-600" : "bg-blue-600";
  
  return (
    <div ref={ref}>
      <div className={`${gradientClass} backdrop-blur-sm rounded-xl p-4 border-2 shadow-lg`}>
        <h3 className={`text-sm font-bold text-center ${textColorClass} mb-6`}>
          {playerName}
          {gameState.currentPlayer === player && <span className="ml-2 text-green-600 font-bold">(Active)</span>}
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              {!isPlayer2 ? (
                <>
                  {/* Player 1 (NPC) Content */}
                  <div 
                    className={`transform scale-75 cursor-pointer hover:scale-80 transition-transform ${
                      targetingMode ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''
                    }`}
                    onClick={() => onSPVClick(player, index)}
                    title={targetingMode 
                      ? targetingMode.card.type === "attack"
                        ? `Target ${playerName} Server ${index + 1} with ${targetingMode.card.type}` 
                        : `Cannot heal enemy server`
                      : `${playerName} Server ${index + 1} - SPV: ${spvValues[index]}/5`}
                  >
                    <GameCard 
                      type="defence" 
                      category="BACKUP" 
                      value={spvValues[index]} 
                    />
                    <div className={`absolute inset-0 rounded-lg backdrop-blur-sm ${
                      spvValues[index] > 3 ? 'bg-gradient-to-br from-green-600/70 to-green-700/70' :
                      spvValues[index] > 1 ? 'bg-gradient-to-br from-yellow-600/70 to-orange-600/70' :
                      spvValues[index] > 0 ? 'bg-gradient-to-br from-red-600/70 to-red-700/70' :
                      'bg-gradient-to-br from-gray-600/70 to-gray-800/70'
                    }`}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-xs drop-shadow-lg">
                        SPV {spvValues[index]}
                      </span>
                    </div>
                  </div>
                  
                  <div 
                    className={`w-35 h-49 relative border-2 rounded-xl flex items-center justify-center transition-all duration-300 transform-gpu backdrop-blur-sm hover:scale-105 hover:shadow-xl cursor-pointer ${
                      selectedDefenseCard && gameState.currentPlayer === "player2" && !defenseLayer[index]
                        ? 'border-solid border-green-400 bg-gradient-to-br from-green-100/40 to-emerald-200/40 animate-pulse shadow-lg shadow-green-400/30' 
                        : `border-dashed ${defenseBorderClass}`
                    }`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const cardData = e.dataTransfer.getData("application/json");
                      if (cardData) {
                        const card = JSON.parse(cardData);
                        onDefenseCardDrop(index, false)(card);
                      }
                    }}
                    onClick={() => onDefenseCardPlace(index)}
                  >
                    {defenseLayer[index] ? (
                      <div className="relative w-full h-full">
                        <GameCard
                          {...defenseLayer[index]}
                          className="absolute inset-0"
                        />
                        <div className={`absolute -top-1 -right-1 ${healthBadgeClass} text-white text-xs px-1 py-0.5 rounded-full font-bold shadow-lg min-w-[20px] text-center`}>
                          {defenseHealth[index]}
                        </div>
                      </div>
                    ) : (
                      <span className={`text-xs ${defenseTextClass} text-center`}>Defense</span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Player 2 (Human) Content */}
                  <div 
                    className={`w-35 h-49 relative border-2 rounded-xl flex items-center justify-center transition-all duration-300 transform-gpu backdrop-blur-sm hover:scale-105 hover:shadow-xl cursor-pointer ${
                      selectedDefenseCard && gameState.currentPlayer === "player2" && !defenseLayer[index]
                        ? 'border-solid border-green-400 bg-gradient-to-br from-green-100/40 to-emerald-200/40 animate-pulse shadow-lg shadow-green-400/30' 
                        : `border-dashed ${defenseBorderClass}`
                    }`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const cardData = e.dataTransfer.getData("application/json");
                      if (cardData) {
                        const card = JSON.parse(cardData);
                        onDefenseCardDrop(index, true)(card);
                      }
                    }}
                    onClick={() => onDefenseCardPlace(index)}
                  >
                    {defenseLayer[index] ? (
                      <div className="relative w-full h-full">
                        <GameCard
                          {...defenseLayer[index]}
                          className="absolute inset-0"
                        />
                        <div className={`absolute -top-1 -right-1 ${healthBadgeClass} text-white text-xs px-1 py-0.5 rounded-full font-bold shadow-lg min-w-[20px] text-center`}>
                          {defenseHealth[index]}
                        </div>
                      </div>
                    ) : (
                      <span className={`text-xs ${defenseTextClass} text-center`}>Defense</span>
                    )}
                  </div>
                  
                  <div 
                    className={`transform scale-75 transition-transform ${
                      targetingMode 
                        ? targetingMode.card.type === "utility" 
                          ? 'ring-2 ring-green-400 ring-opacity-75 cursor-pointer' 
                          : 'cursor-not-allowed opacity-75'
                        : 'cursor-not-allowed opacity-75'
                    }`}
                    onClick={() => onSPVClick(player, index)}
                    title={
                      targetingMode 
                        ? targetingMode.card.type === "utility"
                          ? `Heal ${playerName} Server ${index + 1} with ${targetingMode.card.type}` 
                          : `Cannot attack your own server`
                        : `${playerName} Server ${index + 1} - SPV: ${spvValues[index]}/5`
                    }
                  >
                    <GameCard 
                      type="defence" 
                      category="PROXY SERVER" 
                      value={spvValues[index]} 
                    />
                    <div className={`absolute inset-0 rounded-lg backdrop-blur-sm ${
                      spvValues[index] > 3 ? 'bg-gradient-to-br from-green-600/70 to-green-700/70' :
                      spvValues[index] > 1 ? 'bg-gradient-to-br from-yellow-600/70 to-orange-600/70' :
                      spvValues[index] > 0 ? 'bg-gradient-to-br from-red-600/70 to-red-700/70' :
                      'bg-gradient-to-br from-gray-600/70 to-gray-800/70'
                    }`}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-xs drop-shadow-lg">
                        SPV {spvValues[index]}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

PlayerArea.displayName = "PlayerArea";