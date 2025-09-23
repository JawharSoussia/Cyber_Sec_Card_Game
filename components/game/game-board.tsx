"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { type GameCardProps} from "@/types/game"
import { GameStatus } from "@/components/game/game-status"
import { useGameState } from "@/hooks/use-game-state"
import { PlayerArea } from "@/components/game/player-area"
import { DeckArea } from "@/components/game/deck-area"
import { PlayerHand } from "@/components/game/player-hand"
import { CardLibrary } from "@/components/game/card-library"
import { WinPopup } from "@/components/game/win-popup"
import { NPCTurnIndicator } from "@/components/game/npc-turn-indicator"
import { addActionToLog, getPlayerName } from "@/utils/helpers"
import { calculateDamage, isServerDestroyed } from "@/utils/card-utils"


// Sample game data using the new card structure
const initialPlayerHand: GameCardProps[] = [
  {
    type: "attack",
    category: "SQL INJECTION",
    value: 5
  },
  {
    type: "defence",
    category: "FIREWALL",
    value: 3
  },
  {
    type: "utility",
    category: "VIRUS SCAN",
    value: 4
  },
  {
    type: "defence",
    category: "MULTI-FACTOR",
    value: 2
  },
  {
    type: "attack",
    category: "PHISHING",
    value: 6
  },
]

// Defense layer - defence cards only
const initialPlayer1DefenseLayer = [
  null,
  null,
  null,
  null,
]

const initialPlayer2DefenseLayer = [
  null,
  null,
  null,
  null,
]

export function GameBoard() {
  const { gameState, showWinPopup, endTurn, playCard, resetGame, damageSPV, restoreSPV, isInitialized, drawCard, addCardToHand, closeWinPopup } = useGameState()
  const [actionLog, setActionLog] = useState<string[]>([])
  const [selectedCard, setSelectedCard] = useState<GameCardProps | null>(null)
  const [draggedCard, setDraggedCard] = useState<GameCardProps | null>(null)
  const [validDropZones, setValidDropZones] = useState<number[]>([])
  const [targetingMode, setTargetingMode] = useState<{card: GameCardProps, player?: string} | null>(null)
  const [selectedDefenseCard, setSelectedDefenseCard] = useState<GameCardProps | null>(null)
  const [showCardLibrary, setShowCardLibrary] = useState(false)
  const [selectedLibraryCard, setSelectedLibraryCard] = useState<GameCardProps | null>(null)

  // Defense layers - separate layer for defense cards only
  const [player1DefenseLayer, setPlayer1DefenseLayer] = useState<(GameCardProps | null)[]>(initialPlayer1DefenseLayer)
  const [player2DefenseLayer, setPlayer2DefenseLayer] = useState<(GameCardProps | null)[]>(initialPlayer2DefenseLayer)
  
  // Defense health tracking - each defense card has its own health points
  const [player1DefenseHealth, setPlayer1DefenseHealth] = useState<number[]>([0, 0, 0, 0])
  const [player2DefenseHealth, setPlayer2DefenseHealth] = useState<number[]>([0, 0, 0, 0])
  
  // Refs for player areas
  const player1AreaRef = useRef<HTMLDivElement>(null)
  const player2AreaRef = useRef<HTMLDivElement>(null)
  const lastActivePlayerRef = useRef<string>(gameState.currentPlayer)

  // Always show Player 2's hand (human player)
  const currentPlayerHand = gameState.player2Hand

  // Function to add action logs
  const addActionLog = (message: string) => {
    setActionLog(prev => addActionToLog(prev, message))
    console.log(message) // Keep console log for debugging
  }

  // Custom playCard function to handle utility and defense cards
  const handlePlayCard = (card: GameCardProps, targetPlayer?: "player1" | "player2", targetIndex?: number) => {
    const currentPlayerName = getPlayerName(gameState.currentPlayer);
    
    if (card.type === "utility") {
      // Utility card - restore SPV health
      if (targetPlayer && targetIndex !== undefined) {
        const currentSPV = targetPlayer === "player1" 
          ? gameState.player1SPV[targetIndex] 
          : gameState.player2SPV[targetIndex];
        
        // Cannot heal destroyed servers (SPV = 0)
        if (isServerDestroyed(currentSPV)) {
          addActionLog(`${currentPlayerName} tried to heal destroyed Server ${targetIndex + 1} - Action failed!`);
          return; // Exit without consuming card or move
        }
        
        // Remove card from hand and handle moves only if action is valid
        playCard(card);
        
        if (currentSPV < 5) {
          const restoreAmount = Math.min(card.value || 0, 5 - currentSPV);
          restoreSPV(targetPlayer, targetIndex, restoreAmount);
          addActionLog(`${currentPlayerName} played ${card.category} (${card.value}) to heal Server ${targetIndex + 1} by ${restoreAmount} SPV`);
        }
      }
    } else if (card.type === "attack" && targetPlayer && targetIndex !== undefined) {
      // Remove card from hand and handle moves for attack cards
      playCard(card);
      
      const defenseLayer = targetPlayer === "player1" ? player1DefenseLayer : player2DefenseLayer;
      const defenseCard = defenseLayer[targetIndex];
      const defenseHealth = targetPlayer === "player1" ? player1DefenseHealth : player2DefenseHealth;
      const targetPlayerName = targetPlayer === "player1" ? "Player 1" : "Player 2";
      
      if (defenseCard && defenseHealth[targetIndex] > 0) {
        const attackDamage = card.value || 0;
        const currentDefenseHealth = defenseHealth[targetIndex];
        
        const { defenseDamage, remainingDamage } = calculateDamage(attackDamage, currentDefenseHealth);
        
        if (attackDamage >= currentDefenseHealth) {
          addActionLog(`${currentPlayerName} played ${card.category} (${attackDamage}) vs ${defenseCard.category} (${currentDefenseHealth}) - Defense destroyed!`);
          
          // Remove defense card and reset its health
          if (targetPlayer === "player1") {
            setPlayer1DefenseLayer(prev => {
              const newLayer = [...prev];
              newLayer[targetIndex] = null;
              return newLayer;
            });
            setPlayer1DefenseHealth(prev => {
              const newHealth = [...prev];
              newHealth[targetIndex] = 0;
              return newHealth;
            });
          } else {
            setPlayer2DefenseLayer(prev => {
              const newLayer = [...prev];
              newLayer[targetIndex] = null;
              return newLayer;
            });
            setPlayer2DefenseHealth(prev => {
              const newHealth = [...prev];
              newHealth[targetIndex] = 0;
              return newHealth;
            });
          }
          
          // Apply remaining damage to SPV only if there is remaining damage
          if (remainingDamage > 0) {
            damageSPV(targetPlayer, targetIndex, remainingDamage);
            addActionLog(`Remaining ${remainingDamage} damage applied to ${targetPlayerName} Server ${targetIndex + 1}`);
          }
        } else {
          // Attack is less than defense health - only reduce defense health, no SPV damage
          const newDefenseHealth = currentDefenseHealth - attackDamage;
          addActionLog(`${currentPlayerName} played ${card.category} (${attackDamage}) vs ${defenseCard.category} - Defense reduced to ${newDefenseHealth}`);
          
          if (targetPlayer === "player1") {
            setPlayer1DefenseHealth(prev => {
              const newHealth = [...prev];
              newHealth[targetIndex] = newDefenseHealth;
              return newHealth;
            });
          } else {
            setPlayer2DefenseHealth(prev => {
              const newHealth = [...prev];
              newHealth[targetIndex] = newDefenseHealth;
              return newHealth;
            });
          }
          // NO SPV damage when attack is absorbed by defense
        }
      } else {
        // No defense card or defense health is 0 - direct hit to SPV
        addActionLog(`${currentPlayerName} played ${card.category} (${card.value}) - Direct hit to ${targetPlayerName} Server ${targetIndex + 1}`);
        damageSPV(targetPlayer, targetIndex, card.value||0);
      }
    } else if (card.type === "defence") {
      // Remove card from hand and handle moves for defense cards
      playCard(card);
      addActionLog(`${currentPlayerName} placed ${card.category} (${card.value} defense points)`);
    }
  }

  // Easy-level NPC intelligence for Player 1
  const executeNPCTurn = () => {
    if (gameState.currentPlayer !== "player1" || gameState.movesRemaining <= 0 || gameState.gameOver) {
      return
    }

    // Get NPC hand and defense state
    const npcHand = [...gameState.player1Hand]
    const npcDefenseLayer = [...player1DefenseLayer]
    
    // Easy AI strategy:
    // 1. First priority: Play defense cards if any SPV is low
    // 2. Second priority: Play utility cards to heal low SPVs
    // 3. Third priority: Play attack cards on a random player SPV
    // 4. If no good moves, draw a card or end turn

    // Check for defense cards to play
    const defenseCards = npcHand.filter(card => card.type === "defence")
    if (defenseCards.length > 0) {
      // Find the first empty defense slot with a non-destroyed server
      const npcSPVs = gameState.player1SPV
      let validDefenseSlotIndex = -1
      
      for (let i = 0; i < npcDefenseLayer.length; i++) {
        if (npcDefenseLayer[i] === null && npcSPVs[i] > 0) {
          validDefenseSlotIndex = i
          break
        }
      }
      
      if (validDefenseSlotIndex !== -1) {
        // Play the first defense card
        const defenseCard = defenseCards[0]
        handlePlayCard(defenseCard)
        setPlayer1DefenseLayer(prev => {
          const newLayer = [...prev]
          newLayer[validDefenseSlotIndex] = defenseCard
          return newLayer
        })
        // Set defense card health to its value
        setPlayer1DefenseHealth(prev => {
          const newHealth = [...prev]
          newHealth[validDefenseSlotIndex] = defenseCard.value || 0
          return newHealth
        })
        return
      }
    }

    // Check for utility cards to play (heal low SPVs)
    const utilityCards = npcHand.filter(card => card.type === "utility")
    if (utilityCards.length > 0) {
      // Find NPC's lowest SPV
      const npcSPVs = gameState.player1SPV
      let lowestSPVIndex = 0
      let lowestSPVValue = npcSPVs[0]
      
      for (let i = 1; i < npcSPVs.length; i++) {
        if (npcSPVs[i] < lowestSPVValue) {
          lowestSPVIndex = i
          lowestSPVValue = npcSPVs[i]
        }
      }
      
      // Heal the lowest SPV if it's not at max and not destroyed
      if (lowestSPVValue < 5 && lowestSPVValue > 0) {
        const utilityCard = utilityCards[0]
        handlePlayCard(utilityCard, "player1", lowestSPVIndex)
        return
      }
    }

    // Check for attack cards to play
    const attackCards = npcHand.filter(card => card.type === "attack");
    if (attackCards.length > 0) {
      // Find a random player SPV to attack (instead of the weakest)
      const playerSPVs = gameState.player2SPV;
      
      // Create an array of indices for non-destroyed SPVs (SPV > 0)
      const validTargetIndices = [];
      for (let i = 0; i < playerSPVs.length; i++) {
        if (playerSPVs[i] > 0) {
          validTargetIndices.push(i);
        }
      }
      
      // If all SPVs are destroyed, just pick any index
      if (validTargetIndices.length === 0) {
        for (let i = 0; i < playerSPVs.length; i++) {
          validTargetIndices.push(i);
        }
      }
      
      // Select a random target from the valid indices
      const randomIndex = Math.floor(Math.random() * validTargetIndices.length);
      const randomSPVIndex = validTargetIndices[randomIndex];
      
      // Play the first attack card on the random SPV
      const attackCard = attackCards[0];
      handlePlayCard(attackCard, "player2", randomSPVIndex);
      return;
    }

    // If we have cards but can't play them, try to draw or end turn
    if (npcHand.length < 7 && gameState.deck.length > 0) {
      drawCard("player1");
    } else {
      // No good moves, end turn
      endTurn();
    }
  }

  const handleDragStart =
    (card: GameCardProps, fromHand = false) =>
    (e: React.DragEvent) => {
      // Prevent dragging during NPC turn
      if (gameState.currentPlayer === "player1") {
        e.preventDefault()
        return
      }
      
      if (gameState.movesRemaining <= 0 || gameState.gameOver) {
        e.preventDefault()
        return
      }

      setDraggedCard(card)
      e.dataTransfer.setData("application/json", JSON.stringify({ ...card, fromHand }))

      // No visual recommendations when dragging from hand
    }

  const handleDragEnd = () => {
    setDraggedCard(null)
    setValidDropZones([])
  }

  // Simplified card placement - only for defense cards
 // Simplified card placement - only for defense cards
const handleDefenseCardDrop =
  (slotIndex: number, isPlayer2 = false) =>
  (droppedCard: GameCardProps & { fromHand?: boolean }) => {
    // Prevent dropping during NPC turn
    if (gameState.currentPlayer === "player1") {
      return
    }
    
    if (gameState.movesRemaining <= 0 || gameState.gameOver) {
      return
    }
    if (droppedCard.fromHand && droppedCard.type === "defence") {
      // Only allow Player 2 to drop defense cards in their own area (Player 2 area)
      const isPlayer2DroppingInOwnArea = (gameState.currentPlayer === "player2" && isPlayer2);
      
      // Player 1 should not be able to drop defense cards manually (NPC only)
      
      
      if (!isPlayer2DroppingInOwnArea) {
        return
      }
      
      // Check if the server is destroyed (SPV = 0)
      const targetSPV = isPlayer2 ? gameState.player2SPV[slotIndex] : gameState.player1SPV[slotIndex];
      if (isServerDestroyed(targetSPV)) {
        addActionLog(`Cannot place defense on destroyed Server ${slotIndex + 1} - Server must be repaired first!`);
        return; // Exit without consuming card or move
      }
      
      // Get existing defense card - only allow placement on empty slots
      const currentDefenseLayer = isPlayer2 ? player2DefenseLayer : player1DefenseLayer
      const existingCard = currentDefenseLayer[slotIndex]
      
      // Don't allow swapping - only placement on empty slots
      if (existingCard) {
        addActionLog(`Cannot place defense - slot ${slotIndex + 1} is already occupied!`);
        return;
      }
      
      // Place defense card
      if (isPlayer2) {
        setPlayer2DefenseLayer((prev) => {
          const newLayer = [...prev]
          newLayer[slotIndex] = { 
            type: droppedCard.type, 
            category: droppedCard.category,
            value: droppedCard.value 
          }
          return newLayer
        })
        // Set defense health
        setPlayer2DefenseHealth((prev) => {
          const newHealth = [...prev]
          newHealth[slotIndex] = droppedCard.value || 0
          return newHealth
        })
      } else {
        setPlayer1DefenseLayer((prev) => {
          const newLayer = [...prev]
          newLayer[slotIndex] = { 
            type: droppedCard.type, 
            category: droppedCard.category,
            value: droppedCard.value 
          }
          return newLayer
        })
        // Set defense health
        setPlayer1DefenseHealth((prev) => {
          const newHealth = [...prev]
          newHealth[slotIndex] = droppedCard.value || 0
          return newHealth
        })
      }

      // Play the new card
      handlePlayCard(droppedCard)
    }
  }

  const handleCardClick = (card: GameCardProps) => {
    // Prevent clicking during NPC turn
    if (gameState.currentPlayer === "player1") {
      return
    }
    
    if (gameState.gameOver) return
    
    // If card requires targeting (attack or utility), enter targeting mode
    if (card.type === "attack" || card.type === "utility") {
      setTargetingMode({ card })
      setSelectedCard(card)
      setSelectedDefenseCard(null)
    } else if (card.type === "defence") {
      // For defense cards, enter defense placement mode
      setSelectedDefenseCard(card)
      setSelectedCard(card)
      setTargetingMode(null)
    }
  }

  const handleSPVClick = (player: "player1" | "player2", slotIndex: number) => {
    // Prevent clicking during NPC turn
    if (gameState.currentPlayer === "player1") {
      return
    }
    
    if (gameState.gameOver) return
    
    if (targetingMode) {
      // Prevent attacking your own SPV or healing enemy SPV
      if (targetingMode.card.type === "attack" && player === "player2") {
        // Can't attack your own SPV
        return
      }
      
      if (targetingMode.card.type === "utility" && player === "player1") {
        // Can't heal enemy SPV
        return
      }
      
      // Check if target is valid before playing the card
      if (targetingMode.card.type === "utility") {
        const targetSPV = player === "player1" ? gameState.player1SPV[slotIndex] : gameState.player2SPV[slotIndex];
        if (isServerDestroyed(targetSPV)) {
          addActionLog(`Cannot heal destroyed Server ${slotIndex + 1} - Server must be repaired first!`);
          setTargetingMode(null)
          setSelectedCard(null)
          return;
        }
      }
      
      // Play the targeted card
      handlePlayCard(targetingMode.card, player, slotIndex)
      setTargetingMode(null)
      setSelectedCard(null)
    }
  }

  const handleResetGame = () => {
    resetGame()
    setPlayer1DefenseLayer(initialPlayer1DefenseLayer)
    setPlayer2DefenseLayer(initialPlayer2DefenseLayer)
    setPlayer1DefenseHealth([0, 0, 0, 0])
    setPlayer2DefenseHealth([0, 0, 0, 0])
    setSelectedCard(null)
    setSelectedDefenseCard(null)
    setTargetingMode(null)
  }

  // Auto-scroll to active player area and handle NPC turns
  useEffect(() => {
    if (gameState.currentPlayer !== lastActivePlayerRef.current) {
      lastActivePlayerRef.current = gameState.currentPlayer
      
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (gameState.currentPlayer === "player1" && player1AreaRef.current) {
          player1AreaRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
          })
        } else if (gameState.currentPlayer === "player2" && player2AreaRef.current) {
          player2AreaRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
          })
        }
      }, 100)
    }

    // Handle NPC (Player 1) turn
    if (gameState.currentPlayer === "player1" && gameState.movesRemaining > 0 && !gameState.gameOver) {
      // Delay NPC actions to make it feel more natural
      const npcTurnDelay = setTimeout(() => {
        executeNPCTurn()
      }, 1500)

      return () => clearTimeout(npcTurnDelay)
    }
  }, [gameState.currentPlayer, gameState.movesRemaining, gameState.gameOver])

  // Show loading state while deck is being initialized
  if (!isInitialized) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-4">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Shuffling deck and dealing cards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full mx-auto ">
      {/* NPC Turn Indicator */}
      {gameState.currentPlayer === "player1" && <NPCTurnIndicator />}
      
      {/* Win Popup */}
      {showWinPopup && (
        <WinPopup 
          gameState={gameState} 
          onResetGame={() => {
            handleResetGame();
            closeWinPopup();
          }} 
        />
      )}
      
      {/* Main Layout with Side Status Bars */}
      <div className="flex gap-4 items-start justify-center">
        {/* Left Status Panel */}
        <div className="w-60 flex-shrink-0">
          <GameStatus 
            gameState={gameState} 
            actionLog={actionLog} 
            onEndTurn={endTurn} 
            onResetGame={handleResetGame}
            position="left"
          />
        </div>

        {/* 3D Game Board Container - Fixed width to prevent expansion */}
        <div className="w-fit max-w-4xl relative perspective-[1000px]">
          {/* Main 3D Game Board */}
          <div className="relative bg-gradient-to-b from-blue-300/100 via-blue-50/90 to-red-200/90 backdrop-blur-sm rounded-3xl shadow-2xl  transform-gpu preserve-3d" 
               style={{ transform: 'rotateX(25deg) ' }}>
            
            {/* Board Inner Shadow */}
            <div className="absolute inset-4 bg-gradient-to-br from-white-50/50 to-white-100/50 rounded-2xl shadow-inner"></div>
            
            {/* Game Board Layout */}
            <div className="relative z-10 p-8">
              
              {/* Top Player Area (Player 1 - NPC) */}
              <PlayerArea
                ref={player1AreaRef}
                player="player1"
                gameState={gameState}
                defenseLayer={player1DefenseLayer}
                defenseHealth={player1DefenseHealth}
                targetingMode={targetingMode}
                selectedDefenseCard={selectedDefenseCard}
                onDefenseCardDrop={handleDefenseCardDrop}
                onSPVClick={handleSPVClick}
                onDefenseCardPlace={() => {
                  // Player 1 should not be able to manually place defense cards
                }}
              />
              
              {/* Center Area - Deck and Special Cards */}
              <DeckArea 
                gameState={gameState}
                currentPlayerHand={currentPlayerHand}
                onDrawCard={() => {
                  if (gameState.currentPlayer === "player1") return // Prevent drawing during NPC turn
                  if (gameState.movesRemaining > 0 && !gameState.gameOver && gameState.deck.length > 0 && currentPlayerHand.length < 7) {
                    drawCard(gameState.currentPlayer)
                  }
                }}
              />
              
              {/* Bottom Player Area (Player 2 - Human) */}
              <PlayerArea
                ref={player2AreaRef}
                player="player2"
                gameState={gameState}
                defenseLayer={player2DefenseLayer}
                defenseHealth={player2DefenseHealth}
                targetingMode={targetingMode}
                selectedDefenseCard={selectedDefenseCard}
                onDefenseCardDrop={handleDefenseCardDrop}
                onSPVClick={handleSPVClick}
                onDefenseCardPlace={(index) => {
                  if (selectedDefenseCard && gameState.currentPlayer === "player2" && !player2DefenseLayer[index]) {
                    // Check if the server is destroyed (SPV = 0)
                    const currentSPV = gameState.player2SPV[index];
                    if (isServerDestroyed(currentSPV)) {
                      addActionLog(`Cannot place defense on destroyed Server ${index + 1} - Server must be repaired first!`);
                      setSelectedDefenseCard(null);
                      setSelectedCard(null);
                      return;
                    }
                    
                    // Place defense card
                    setPlayer2DefenseLayer((prev) => {
                      const newLayer = [...prev]
                      newLayer[index] = { 
                        type: selectedDefenseCard.type, 
                        category: selectedDefenseCard.category,
                        value: selectedDefenseCard.value 
                      }
                      return newLayer
                    })
                    
                    // Set defense card health to its value
                    setPlayer2DefenseHealth((prev) => {
                      const newHealth = [...prev]
                      newHealth[index] = selectedDefenseCard.value || 0
                      return newHealth
                    })

                    // Play the new card
                    handlePlayCard(selectedDefenseCard)
                    
                    // Clear selection
                    setSelectedDefenseCard(null)
                    setSelectedCard(null)
                  }
                }}
              />
            </div>
          </div>

          {/* Player Hand - Positioned after Player 2 area */}
          <PlayerHand
            currentPlayerHand={currentPlayerHand}
            gameState={gameState}
            targetingMode={targetingMode}
            selectedCard={selectedCard}
            onCardClick={handleCardClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onCancelTargeting={() => {
              setTargetingMode(null)
              setSelectedCard(null)
            }}
          />
        </div>
        
        {/* Right Status Panel */}
        <div className="w-60 flex-shrink-0">
          <GameStatus
            gameState={gameState} 
            actionLog={actionLog} 
            onEndTurn={endTurn} 
            onResetGame={resetGame} 
            onOpenCardLibrary={() => setShowCardLibrary(true)}
            position="right" 
          />
        </div>
      </div>

      {/* Card Library Modal */}
      {showCardLibrary && (
        <CardLibrary
          selectedLibraryCard={selectedLibraryCard}
          onSelectLibraryCard={setSelectedLibraryCard}
          onClose={() => { setShowCardLibrary(false); setSelectedLibraryCard(null) }}
        />
      )}
    </div>
  )
}