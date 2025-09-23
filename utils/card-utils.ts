import { GameCardProps } from "@/types/game";

export const shuffleDeck = (deck: GameCardProps[]): GameCardProps[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};




export const isServerDestroyed = (spvValue: number): boolean => {
  return spvValue === 0;
};

export const calculateDamage = (attackValue: number, defenseValue: number): { defenseDamage: number, remainingDamage: number } => {
  if (attackValue >= defenseValue) {
    return {
      defenseDamage: defenseValue,
      remainingDamage: attackValue - defenseValue
    };
  } else {
    return {
      defenseDamage: attackValue,
      remainingDamage: 0
    };
  }
};