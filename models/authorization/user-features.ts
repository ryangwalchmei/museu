const availableFeatures = new Set([
  // USER
  "create:user",
  "read:user",
  "read:user:others",
  "update:user",
  "update:user:others",

  // ACTIVATION_TOKEN
  "read:activation_token",

  // SESSION
  "create:session",
  "read:session",
]);

export default Object.freeze(availableFeatures);
