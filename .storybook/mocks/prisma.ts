// Storybook mock: no real DB connection needed
export const prisma = new Proxy({} as Record<string, unknown>, {
  get: (_target, prop) => {
    if (prop === '$disconnect' || prop === '$connect') return async () => {};
    // Return a chainable mock for any model
    return new Proxy(() => Promise.resolve(null), {
      get: () => () => Promise.resolve(null),
    });
  },
});
