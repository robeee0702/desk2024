import { currentUser } from '@clerk/nextjs';

export async function getServerAuthData() {
  try {
    const user = await currentUser();
    return { user };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { user: null };
  }
}


