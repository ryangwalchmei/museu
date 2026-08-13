const availableFeatures = new Set([
  // USER
  "create:user",
  "read:user",
  "read:user:others",
  "update:user",
  "update:user:others",
  "read:user:self",

  // ACTIVATION_TOKEN
  "read:activation_token",

  // SESSION
  "create:session",
  "read:session",

  //ADM
  "read:status:all",
]);

export default Object.freeze(availableFeatures);
