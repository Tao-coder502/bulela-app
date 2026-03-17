import { UserRepository } from "../../repositories/UserRepository";
import { EventRepository } from "../../repositories/EventRepository";
import { clerkClient } from "@clerk/fastify";

export class UserService {
  constructor(
    private userRepo: UserRepository,
    private eventRepo: EventRepository
  ) {}

  async syncWithClerk(userId: string) {
    const existingUser = await this.userRepo.findById(userId);
    if (!existingUser) {
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        const newUser = await this.userRepo.create({
          id: userId,
          name: clerkUser.firstName || 'Learner',
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          role: 'student',
          subscriptionTier: 'free',
          kPoints: 0,
          totalXp: 0,
        });

        // Audit: User Creation
        await this.eventRepo.create({
          id: `audit_create_${Date.now()}`,
          userId,
          type: 'AUDIT_USER_CREATED',
          payload: { email: newUser[0].email, name: newUser[0].name },
          timestamp: new Date(),
        });

        return newUser[0];
      } catch (error) {
        console.error("[Clerk] Failed to fetch user during sync:", error);
        return this.userRepo.create({
          id: userId,
          name: 'Learner',
          email: '',
          role: 'student',
          subscriptionTier: 'free',
          kPoints: 0,
          totalXp: 0,
        });
      }
    }
    return existingUser;
  }

  async onboard(userId: string, role: 'student' | 'teacher' | 'admin' | 'individual') {
    await this.syncWithClerk(userId);
    const user = await this.userRepo.update(userId, { role });
    
    // Audit: Role Change
    await this.eventRepo.create({
      id: `audit_role_${Date.now()}`,
      userId,
      type: 'AUDIT_ROLE_CHANGE',
      payload: { newRole: role },
      timestamp: new Date(),
    });

    return user;
  }

  async getUserData(userId: string) {
    return this.userRepo.findById(userId);
  }

  async updateSentiment(userId: string, sentiment: string) {
    return this.userRepo.update(userId, { lastSentiment: sentiment });
  }

  async upgradeToPro(userId: string, stripeCustomerId?: string, stripeSubscriptionId?: string) {
    const user = await this.userRepo.update(userId, { 
      subscriptionTier: 'pro',
      stripeCustomerId,
      stripeSubscriptionId
    });

    // Audit: Subscription Upgrade
    await this.eventRepo.create({
      id: `audit_sub_${Date.now()}`,
      userId,
      type: 'AUDIT_SUBSCRIPTION_UPGRADE',
      payload: { tier: 'pro', stripeCustomerId },
      timestamp: new Date(),
    });

    return user;
  }
}
