export enum Users {
  Marin = "marin",
  Marion = "marion",
}
export const CURRENT_USER_COOKIE = "CURRENT_USER_COOKIE";
export const CURRENT_USER_CACHE_TAG = "CURRENT_USER_CACHE_TAG";

export type User = {
  user: Users;
  initials: string;
};

export const getCurrentUser = (currentUser: string | undefined) => {
  switch (currentUser) {
    case Users.Marion:
      return {
        user: Users.Marion,
        initials: "MB",
      };
    case Users.Marin:
    default:
      return {
        user: Users.Marin,
        initials: "MR",
      };
  }
};
