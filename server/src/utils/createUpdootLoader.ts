import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";
export const createUpdootLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Updoot | null>(
    async (keys) => {
      const updoots = await Updoot.findByIds(keys as any);

      const updootIdsToUpdoot: Record<string, Updoot> = {};

      updoots.forEach((upd) => {
        updootIdsToUpdoot[`${upd.userId}|${upd.postId}`] = upd;
      });
      const result = keys.map(
        (key) => updootIdsToUpdoot[`${key.userId}|${key.postId}`]
      );
      return result;
    }
  );
