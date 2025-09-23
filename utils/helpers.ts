export const addActionToLog = (log: string[], message: string, maxLogSize = 20): string[] => {
  const newLog = [...log, message];
  // Keep the log to a reasonable size
  if (newLog.length > maxLogSize) {
    return newLog.slice(newLog.length - maxLogSize);
  }
  return newLog;
};

export const getPlayerName = (playerId: "player1" | "player2"): string => {
  return playerId === "player1" ? "Player 1 (NPC)" : "Player 2 (You)";
};