import { User } from "./User";

export interface AuthContext {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  isEmailVerified: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUserProfileImageUrl: (newImageUrl: string) => void;
}
