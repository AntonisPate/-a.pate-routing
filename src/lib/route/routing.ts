import { readdirSync } from "fs";
import path from "path";
import { initializeFolders } from "./helpers";
import { Router, Express } from "express";

export const initializeRoutes = (application: Express): void => {
  try {
    const routesPath: string = path.join(__dirname, "../../routes");
    const parentRoutes: string[] = readdirSync(routesPath);
    for (const parentRoute of parentRoutes) {
      const parentRoutePath: string = path.join(routesPath, parentRoute);
      const routes: Router = initializeFolders(parentRoutePath, parentRoute);
      application.use(routes);
    }
  } catch (error: unknown) {
    throw error;
  }
};
