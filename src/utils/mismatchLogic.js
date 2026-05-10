/**
 * Pure client-side logic to detect tactical role mismatches based on AI tags and scorecard text.
 * 
 * @param {Array} players - Array of player objects from the AI analysis
 * @param {string} rawScorecard - The raw unstructured text from CricHeroes
 * @returns {Array} Array of mismatch objects: { playerName, reason, severity }
 */
export const detectRoleMismatches = (players, rawScorecard) => {
  if (!players || !rawScorecard) return [];

  const mismatches = [];
  const lines = rawScorecard.split('\n').map(l => l.trim()).filter(Boolean);

  players.forEach(player => {
    // 1. Batting Order Mismatches
    if (player.role?.toLowerCase() === 'batsman' || player.role?.toLowerCase() === 'allrounder') {
      // Find approximate batting position by finding the first line their name appears in
      // that looks like a batting line (contains ' b ' or ' c ' or ' not out ')
      const battingIndex = lines.findIndex(line => 
        line.toLowerCase().includes(player.name.toLowerCase()) && 
        (line.includes(' c ') || line.includes(' b ') || line.toLowerCase().includes('not out') || line.includes(' lbw '))
      );

      // If we found a valid batting line, estimate their position (assuming roughly 1 name per line in the batting section)
      // This is a heuristic.
      if (battingIndex > -1) {
        // Count how many valid batting lines appear before this player to get exact position
        let position = 1;
        for (let i = 0; i < battingIndex; i++) {
          if (lines[i].includes(' c ') || lines[i].includes(' b ') || lines[i].toLowerCase().includes('not out') || lines[i].includes(' lbw ')) {
            position++;
          }
        }

        // Rule: Anchor batting too low (at #6 or lower)
        if (player.tag === 'Anchor' && position >= 6) {
          mismatches.push({
            playerName: player.name,
            reason: `Anchor deployed too late (at #${position}). They need time to build an innings and stabilize the top/middle order.`,
            severity: 'high'
          });
        }

        // Rule: Finisher/Aggressor batting too high (#1 to #3) with a low impact
        if (player.tag === 'Aggressor' && position <= 3 && player.match_impact && parseInt(player.match_impact) < 5) {
          mismatches.push({
            playerName: player.name,
            reason: `Aggressive finisher deployed too early (at #${position}) and failed to capitalize. Keep them for the back 10 overs.`,
            severity: 'medium'
          });
        }
      }
    }

    // 2. Bowling Mismatches
    if (player.role?.toLowerCase() === 'bowler' || player.role?.toLowerCase() === 'allrounder') {
      const failedText = (player.what_failed || '').toLowerCase();
      const statText = (player.key_stat || '').toLowerCase();
      
      // Check if they are a liability and bowled in death overs or were highly expensive
      const isExpensive = statText.includes('econ') || failedText.includes('expensive') || failedText.includes('runs');
      const isDeathBowler = failedText.includes('death') || failedText.includes('slog') || failedText.includes('last overs');

      // Rule: Expensive bowler used in death overs
      if (player.tag === 'Liability' && isDeathBowler && isExpensive) {
        mismatches.push({
          playerName: player.name,
          reason: `Highly expensive bowler utilized in high-pressure death overs. Rotate them out of the final 4 overs.`,
          severity: 'high'
        });
      }
      
      // Rule: Anchor/Improving bowler not given full quota when economical
      if ((player.tag === 'Anchor' || player.tag === 'Improving') && statText.includes('econ') && failedText.includes('overs')) {
         mismatches.push({
          playerName: player.name,
          reason: `Economical bowler was not utilized for their full quota of overs despite restricting the run rate.`,
          severity: 'medium'
        });
      }
    }
  });

  return mismatches;
};
