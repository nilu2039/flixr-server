import users, { User, UsersInsertType } from "../db/schema/user.schema";
import db from "../db/db";
import { eq } from "drizzle-orm";

export const UserService = {
  async createUser(data: UsersInsertType): Promise<User> {
    const user = await db
      .insert(users)
      .values({
        email: data.email,
        name: data.name,
        googleAccessToken: data.googleAccessToken,
        googleExpiresIn: data.googleExpiresIn,
        googleId: data.googleId,
        googleRefreshToken: data.googleRefreshToken,
        username: data.username,
        role: data.role,
        profileUrlImage: data.profileUrlImage,
      })
      .onConflictDoUpdate({
        target: [users.googleId],
        set: {
          email: data.email,
          name: data.name,
          googleAccessToken: data.googleAccessToken,
          googleExpiresIn: data.googleExpiresIn,
          googleRefreshToken: data.googleRefreshToken,
          username: data.username,
          role: data.role,
          profileUrlImage: data.profileUrlImage,
        },
      })
      .returning();
    return user[0];
  },
  async getUserById(id: number): Promise<User | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!user) {
      return null;
    }
    return user;
  },
  async updateUser(id: number, data: Partial<UsersInsertType>): Promise<User> {
    const user = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user[0];
  },
};
