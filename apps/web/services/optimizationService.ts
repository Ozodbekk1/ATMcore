import { Atm } from '../models/Atm';
import { Prediction } from '../models/Prediction';
import connectToDatabase from '../lib/mongodb';

// Simple haversine distance for clustering/routing
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function optimizeRoutes() {
  await connectToDatabase();
  
  // Get all ATMs and their latest predictions
  const atms = await Atm.find({}).lean();
  const predictions = await Prediction.aggregate([
    { $sort: { timestamp: -1 } },
    { $group: { _id: "$atmId", doc: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: "$doc" } }
  ]);

  const predMap = new Map();
  predictions.forEach(p => predMap.set(p.atmId, p));

  // 1. Filter and Priority Score
  // Priority logic: High risk score + low ETA
  const priorityAtms = atms.map((atm: any) => {
    const pred = predMap.get(atm.atmId);
    const riskScore = pred ? pred.riskScore : 0;
    const eta = pred ? pred.predictedTimeToCashout : 100;
    
    // Custom score combining risk and urgency
    const priorityScore = (riskScore * 0.7) + (Math.max(0, 100 - eta) * 0.3);
    
    return {
      ...atm,
      priorityScore,
      eta
    };
  }).filter(atm => atm.priorityScore > 50); // Only route for ATMs that need it

  // Sort by priority
  priorityAtms.sort((a, b) => b.priorityScore - a.priorityScore);

  if (priorityAtms.length === 0) {
    return [];
  }

  // 2. Greedy Routing Algorithm
  // Simple TSP-like greedy approach for clustering
  const routes = [];
  let currentGroup = [];
  let currentLoc = priorityAtms[0].location;
  let totalDist = 0;
  let avgPriority = 0;
  
  const visited = new Set();
  
  while (visited.size < priorityAtms.length) {
    let nearestIdx = -1;
    let minDist = Infinity;
    let maxPriority = -1;
    
    // Find next ATM for the route
    for (let i = 0; i < priorityAtms.length; i++) {
      if (!visited.has(priorityAtms[i].atmId)) {
        const nextLoc = priorityAtms[i].location;
        const dist = getDistance(currentLoc.lat, currentLoc.lng, nextLoc.lat, nextLoc.lng);
        
        // Prioritize: Nearest neighbor but weighted slightly by priority
        const score = dist - (priorityAtms[i].priorityScore / 10);
        
        if (score < minDist) {
          minDist = dist;
          nearestIdx = i;
        }
      }
    }

    if (nearestIdx !== -1) {
      const atm = priorityAtms[nearestIdx];
      visited.add(atm.atmId);
      currentGroup.push(atm.atmId);
      totalDist += Math.max(0, minDist); // Avoid infinity
      avgPriority += atm.priorityScore;
      currentLoc = atm.location;

      // Group by max 5 stops per vehicle route
      if (currentGroup.length >= 5 || visited.size === priorityAtms.length) {
        routes.push({
          route: [...currentGroup],
          totalDistance: totalDist,
          priorityScore: avgPriority / currentGroup.length
        });
        currentGroup = [];
        totalDist = 0;
        avgPriority = 0;
        
        // Reset starting loc for next route if still items
        const nextUnvis = priorityAtms.findIndex(a => !visited.has(a.atmId));
        if (nextUnvis !== -1) {
             currentLoc = priorityAtms[nextUnvis].location;
        }
      }
    }
  }

  return routes;
}
