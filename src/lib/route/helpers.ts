import express, { Router, NextFunction, Request, Response } from "express";
import { readdirSync, statSync, Stats } from "fs";
import path from "path";

export const initializeFolders = (
  directoryPath: string,
  routeName: string
): Router => {
  try {
    const router: Router = express.Router();
    const folderStats: Stats = statSync(directoryPath);
    if (folderStats.isDirectory()) {
      const folderContents: string[] = readdirSync(directoryPath);

      for (const content of folderContents) {
        const contentPath: string = path.join(directoryPath, content);
        const folderStats: Stats = statSync(contentPath);

        if (folderStats.isDirectory()) {
          const name: string = splitRouteName(contentPath, routeName);
          const routes = initializeFolders(contentPath, name);
          router.use(routes);
        } else {
          const routePath: string = getRoutePath(content);
          const actions: any = require(path.join(directoryPath, content));
          if (Object.keys(actions).length > 0) {
            Object.keys(actions).forEach((action: string) => {
              initializeRoute(
                router,
                `/${routeName}${routePath}`,
                action,
                actions[action],
                getMiddlewareFunction(actions["middleware"])
              );
            });
          } else {
            console.warn(`${content} has no action, no route will initialized`);
          }
        }
      }
    } else {
      var x = 5;
      const routePath: string = getRoutePath(routeName);
      const actions: any = require(directoryPath);
      if (Object.keys(actions).length > 0) {
        Object.keys(actions).forEach((action: string) => {
          initializeRoute(
            router,
            routePath,
            action,
            actions[action],
            getMiddlewareFunction(actions["middleware"])
          );
        });
      } else {
        console.warn(`/ has no action, no route will initialized`);
      }
    }
    return router;
  } catch (error: unknown) {
    throw error;
  }
};

const initializeRoute = (
  router: Router,
  path: string,
  actionName: any,
  action: any,
  middleware: any
): void => {
  switch (actionName) {
    case "getRequest":
      router.get(path, middleware, action);
      break;
    case "postRequest":
      router.post(path, middleware, action);
      break;
    case "putRequest":
      router.put(path, middleware, action);
      break;

    case "patchRequest":
      router.patch(path, middleware, action);
      break;

    case "deleteRequest":
      router.delete(path, middleware, action);
      break;

    default:
      break;
  }
};

const getRoutePath = (name: string): string => {
  if (name === "index.ts") {
    return "/";
  } else if (name.includes("[") && name.includes("]")) {
    const path: string = name.replace(".ts", "");
    const param: string | null = path.match(/\[(.*?)\]/)
      ? path.match(/\[(.*?)\]/)![1]
      : null;
    if (param) {
      return `/:${param}`;
    }
    return path;
  } else {
    return `/${name.replace(".ts", "")}`;
  }
};

const getMiddlewareFunction = (action: any): any => {
  if (action) {
    return action;
  }
  return async (request: Request, response: Response, next: NextFunction) => {
    next();
  };
};

const splitRouteName = (routePath: string, name: string): string => {
  const parsedPath = path.parse(routePath);
  const { dir, base } = parsedPath;
  const parts = dir.split(path.sep);
  parts.push(base);

  let routeName = "";
  for (let i = parts.length - 1; i > 0; i--) {
    if (parts[i] === "routes") break;
    routeName = parts[i] + routeName;
    if (i > 0 && parts[i - 1] !== "routes") {
      routeName = "/" + routeName;
    }
  }
  return routeName;
};
