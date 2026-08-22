import { UserModel } from '../models/user.model';

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  problemsSolved: number;
  totalSubmissions: number;
  accuracy: number;
}

export class LeaderboardService {
  async getGlobalLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    const users = await UserModel.find({})
      .select('name problemsSolved totalSubmissions')
      .sort({ problemsSolved: -1, totalSubmissions: 1 })
      .limit(limit)
      .lean();

    return users.map((user, index) => {
      const accuracy = user.totalSubmissions > 0
        ? Math.min(100, Math.round((user.problemsSolved / user.totalSubmissions) * 100 * 100) / 100)
        : 0;

      return {
        rank: index + 1,
        id: user._id.toString(),
        name: user.name,
        problemsSolved: user.problemsSolved,
        totalSubmissions: user.totalSubmissions,
        accuracy
      };
    });
  }
}
