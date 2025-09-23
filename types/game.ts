export type CardType = "attack" | "defence" | "utility" | "player"  
export type CardCategory = 
  | "SQL INJECTION" | "DDOS ATTACK" | "RANSOMWARE" | "PHISHING" 
  | "BRUTE FORCE" | "ZERO-DAY" | "WORM" | "ROOTKIT" | "KEYLOGGER" 
  | "FIREWALL" | "DATA VAULT" | "HONEYPOT" | "BACKUP" | "PORT SCANNER" 
  | "MULTI-FACTOR" | "ENCRYPTED" | "SEGMENTATION" | "DECOY SYSTEM" 
  | "PROXY SERVER" | "AUDIT" | "VIRUS SCAN" | "FORCE REBOOT" 
  | "SCAN" | "OVERCLOCK" | "PATCH"
export interface GameCardProps {
  type: CardType
  category: CardCategory
  value?: number
  isActive?: boolean
  isDragging?: boolean
  className?: string
  size?: "small" | "normal" | "large"
  hoverEffect?: boolean
  onClick?: () => void
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
}

export type Player = "player1" | "player2"

export interface GameState {
  currentPlayer: Player
  turn: number
  movesRemaining: number 
  player1Score: number
  player2Score: number
  player1Health: number
  player2Health: number
  gameOver: boolean
  winner: Player | null
  deck: GameCardProps[]
  player1Hand: GameCardProps[]
  player2Hand: GameCardProps[]
  // SPV (Server Protection Value) - each slot has 5 health units
  player1SPV: number[] // Array of 4 SPV values (one per card slot)
  player2SPV: number[] // Array of 4 SPV values (one per card slot)
}

export interface PlayerAreaProps {
  player: "player1" | "player2";
  gameState: GameState;
  defenseLayer: (GameCardProps | null)[];
  defenseHealth: number[];
  targetingMode: any;
  selectedDefenseCard: GameCardProps | null;
  onDefenseCardDrop: (slotIndex: number, isPlayer2: boolean) => (droppedCard: any) => void;
  onSPVClick: (player: "player1" | "player2", slotIndex: number) => void;
  onDefenseCardPlace: (index: number) => void;
}

export interface DeckAreaProps {
  gameState: GameState;
  currentPlayerHand: GameCardProps[];
  onDrawCard: () => void;
}

export interface PlayerHandProps {
  currentPlayerHand: GameCardProps[];
  gameState: GameState;
  targetingMode: any;
  selectedCard: GameCardProps | null;
  onCardClick: (card: GameCardProps) => void;
  onDragStart: (card: GameCardProps, fromHand: boolean) => (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onCancelTargeting: () => void;
}

export interface CardLibraryProps {
  selectedLibraryCard: GameCardProps | null;
  onSelectLibraryCard: (card: GameCardProps) => void;
  onClose: () => void;
}

export interface WinPopupProps {
  gameState: GameState;
  onResetGame: () => void;
}
export interface GameStatusProps {
  gameState: GameState
  actionLog: string[]
  onEndTurn: () => void
  onResetGame: () => void
  onOpenCardLibrary?: () => void
  position?: "left" | "right" | "top"
}
export interface CardSlotProps {
  card?: GameCardProps
  isEmpty?: boolean
  isValidDropTarget?: boolean
  className?: string
  title?: string
  onDrop?: (card: GameCardProps) => void
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
}