"use server";

export async function verifyAdminPassword(inputPassword) {
  // Yeh process.env server par hi access hoga, browser me nahi dikhega
  const actualPassword = process.env.ADMIN_PASSWORD;
  
  if (inputPassword === actualPassword) {
    return true;
  }
  return false;
}