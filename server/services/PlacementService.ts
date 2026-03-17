import { UserRepository } from "../../repositories/UserRepository";

export type LearnerTier = 'MWAYI' | 'CHIKONDI' | 'DOLO';

export class PlacementService {
  constructor(private userRepo: UserRepository) {}

  /**
   * Evaluates placement mission results and assigns a tier.
   * MWAYI: 0-1 correct
   * CHIKONDI: 2 correct
   * DOLO: 3 correct
   */
  async runPlacement(userId: string, results: { score: number, total: number }) {
    let tier: LearnerTier = 'MWAYI';
    const percentage = (results.score / results.total) * 100;

    if (percentage >= 90) {
      tier = 'DOLO';
    } else if (percentage >= 60) {
      tier = 'CHIKONDI';
    }

    await this.userRepo.update(userId, { learnerTier: tier });
    return tier;
  }
}
