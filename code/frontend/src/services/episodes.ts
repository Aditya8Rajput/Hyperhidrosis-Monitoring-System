import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Episode } from "../types";

/**
 * Helper to extract and log composite index creation URL if missing
 */
export const handleFirestoreError = (componentName: string, error: any) => {
  console.error(`[${componentName}] Firestore query error:`, error);
  const urlMatch = error?.message?.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
  if (urlMatch) {
    console.error(
      `%c🔥 [${componentName}] MISSING FIRESTORE INDEX!\nClick this link to build the index automatically with one click:\n${urlMatch[0]}`,
      "color: #ef4444; font-weight: bold; font-size: 13px;"
    );
  } else if (error?.message?.includes("requires an index")) {
    console.warn(`[${componentName}] Index required: ${error.message}`);
  }
};

/**
 * Real-time listener for user episodes with sorting and optional limit
 */
export const subscribeToEpisodes = (
  userId: string,
  onData: (episodes: Episode[]) => void,
  onError?: (err: any) => void,
  maxLimit?: number
): Unsubscribe => {
  const episodesRef = collection(db, "episodes");

  // Primary query with server-side ordering
  const baseQuery = maxLimit
    ? query(
        episodesRef,
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(maxLimit)
      )
    : query(
        episodesRef,
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      );

  let fallbackUnsubscribe: Unsubscribe | null = null;

  const unsubscribe = onSnapshot(
    baseQuery,
    (snapshot) => {
      const episodes: Episode[] = [];
      snapshot.forEach((docSnap) => {
        episodes.push({ ...docSnap.data(), id: docSnap.id } as Episode);
      });
      onData(episodes);
    },
    (error) => {
      handleFirestoreError("subscribeToEpisodes", error);
      if (onError) onError(error);

      // Graceful fallback if index is missing: query without orderBy and sort in memory
      if (error?.message?.includes("requires an index")) {
        console.warn(
          "[subscribeToEpisodes] Falling back to client-side sorting while composite index builds in Firebase..."
        );
        const fallbackQuery = query(episodesRef, where("userId", "==", userId));
        fallbackUnsubscribe = onSnapshot(
          fallbackQuery,
          (fallbackSnapshot) => {
            const fallbackEpisodes: Episode[] = [];
            fallbackSnapshot.forEach((docSnap) => {
              fallbackEpisodes.push({ ...docSnap.data(), id: docSnap.id } as Episode);
            });
            fallbackEpisodes.sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            const sliced = maxLimit
              ? fallbackEpisodes.slice(0, maxLimit)
              : fallbackEpisodes;
            onData(sliced);
          },
          (fallbackErr) => {
            handleFirestoreError("subscribeToEpisodes:fallback", fallbackErr);
            if (onError) onError(fallbackErr);
          }
        );
      }
    }
  );

  return () => {
    unsubscribe();
    if (fallbackUnsubscribe) fallbackUnsubscribe();
  };
};

/**
 * Add a new episode log to Firestore
 */
export const logEpisode = async (
  episodeData: Omit<Episode, "id">
) => {
  const docRef = await addDoc(collection(db, "episodes"), {
    ...episodeData,
    createdAt: serverTimestamp(),
  });
  console.log("Saved episode ID:", docRef.id);
  return docRef;
};

/**
 * Delete an episode
 */
export const removeEpisode = async (episodeId: string) => {
  await deleteDoc(doc(db, "episodes", episodeId));
};
