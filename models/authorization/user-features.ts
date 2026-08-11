const availableFeatures = new Set([
  // USER
  "create:user",
  "read:user",

  // ACTIVATION_TOKEN
  "read:activation_token",

  // SESSION
  "create:session",
  "read:session",
]);

export default Object.freeze(availableFeatures);
