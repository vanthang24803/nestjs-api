function initAvatar(fullName: string): string {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${fullName}&radius=50&backgroundColor=00acc1,1e88e5,5e35b1,039be5,43a047,00897b,d81b60,ffb300`;
}

export { initAvatar };
