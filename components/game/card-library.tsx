import { GameCard } from "./game-card";
import { FULL_DECK } from "@/lib/deck";
import { CardLibraryProps } from "@/types/game";

export const CardLibrary = ({ selectedLibraryCard, onSelectLibraryCard, onClose }: CardLibraryProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border border-gray-600">
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            Card Library
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕ Close
          </button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/3 border-r border-gray-600 p-6 flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
            {selectedLibraryCard ? (
              <div className="w-full h-full grid justify-center items-center">
                <GameCard {...selectedLibraryCard} size="large" hoverEffect={false}/>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                Select a card to view details
              </div>
            )}
          </div>
          <div className="flex-1 p-6 overflow-hidden">
            <div className="h-full overflow-y-auto overflow-x-hidden">
              <div className="grid grid-cols-4 gap-4 px-2">
                {FULL_DECK.map((card, index) => (
                  <div 
                    key={index}
                    className="cursor-pointer transform transition-transform flex-shrink-0"
                    onClick={() => onSelectLibraryCard(card)}
                  >
                    <GameCard
                      {...card}
                      isActive={selectedLibraryCard === card}
                      className="shadow-lg w-full"
                      hoverEffect={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};