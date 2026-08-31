import React, { createContext, useContext, useState, useEffect } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import type { UserProfile } from "../types";

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  loginDemoUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync user profile from Firestore or Auth
  const syncUserProfile = async (fbUser: FirebaseUser) => {
    try {
      const userDocRef = doc(db, "users", fbUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: data.displayName || fbUser.displayName || undefined,
          createdAt: data.createdAt || new Date().toISOString(),
          photoURL: fbUser.photoURL,
        });
      } else {
        const newProfile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || "HyperTrack User",
          createdAt: new Date().toISOString(),
          photoURL: fbUser.photoURL,
        };

        // Create doc in Firestore
        await setDoc(userDocRef, {
          ...newProfile,
          serverCreatedAt: serverTimestamp(),
        });

        setUser(newProfile);
      }
    } catch (err) {
      console.warn("Could not sync Firestore user doc (using Auth profile directly):", err);
      // Fallback to local profile
      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || undefined,
        createdAt: new Date().toISOString(),
        photoURL: fbUser.photoURL,
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await syncUserProfile(fbUser);
      } else {
        // Check for active demo session in localStorage
        const savedDemo = localStorage.getItem("hypertrack_demo_user");
        if (savedDemo) {
          try {
            setUser(JSON.parse(savedDemo));
          } catch {
            localStorage.removeItem("hypertrack_demo_user");
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      localStorage.removeItem("hypertrack_demo_user");
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await syncUserProfile(cred.user);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName?: string): Promise<void> => {
    setLoading(true);
    try {
      localStorage.removeItem("hypertrack_demo_user");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && cred.user) {
        await updateProfile(cred.user, { displayName });
      }
      await syncUserProfile(cred.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    localStorage.removeItem("hypertrack_demo_user");
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  // Demo user for quick prototyping & testing
  const loginDemoUser = () => {
    const demoUser: UserProfile = {
      uid: "demo-user-hypertrack-001",
      email: "alex.demo@hypertrack.io",
      displayName: "Alex Mercer",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("hypertrack_demo_user", JSON.stringify(demoUser));
    setUser(demoUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        login,
        signup,
        logout,
        loginDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
