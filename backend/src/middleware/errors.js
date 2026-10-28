import { ValidationError, resourceId } from "../utils/validation.js";

export function handleRouteErrors(router) {
  router.param("id", (req, res, next, value) => {
    try { resourceId(value); next(); } catch (error) { next(error); }
  });
  for (const layer of router.stack) {
    if (!layer.route) continue;
    for (const handler of layer.route.stack) {
      const original = handler.handle;
      handler.handle = (req, res, next) => {
        try { Promise.resolve(original(req, res, next)).catch(next); }
        catch (error) { next(error); }
      };
    }
  }
  return router;
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof ValidationError) return res.status(400).json({ message: error.message });
  if (error.type === "entity.parse.failed") return res.status(400).json({ message: "The request contains invalid JSON" });
  if (error.type === "entity.too.large") return res.status(413).json({ message: "The request is too large" });
  if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "This record already exists" });
  if (error.code === "ER_ROW_IS_REFERENCED_2") return res.status(409).json({ message: "This record is used by an existing booking" });
  console.error("Request failed:", req.method, req.path, error.code || error.name);
  return res.status(500).json({ message: "We could not complete the request. Please try again." });
}
