export const USER_DIRECTORY = {
  "68d2a92538e37d6f7ec31def": {
    name: "Kamal Perera",
    nationalId: "901234567V",
    phone: "0712345678",
    boatName: "Sea Breeze",
    homeAddress: "12 Beach Road, Galle",
  },
};

export function getUserInfo(id) {
  return id ? USER_DIRECTORY[id] || null : null;
}

export function labelFor(id) {
  const u = getUserInfo(id);
  if (u) {
    if (u.name && u.nationalId) return `${u.name} (${u.nationalId})`;
    return u.name || u.nationalId;
  }
  if (!id) return "—";
  return id.length > 10 ? `${id.slice(0,6)}…${id.slice(-4)}` : id;
}
