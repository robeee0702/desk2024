import { ref, get } from 'firebase/database';
import {redirect} from 'next/navigation'
import { auth } from '@clerk/nextjs';
import { database } from '@/firebase';

const authCheck = async () => {

  const userId = auth();


  // Ha a user null vagy undefined, akkor nem vagyunk bejelentkezve
  if (!userId) {
    redirect('/');
  }

  const paymentRef = ref(database, `users/data/${userId.userId}/payment/`);
  const snapshot = await get(paymentRef);
  const paymentData = snapshot.val();
  const isPaid = paymentData?.paid;

  if (!isPaid) {
    redirect('/');
  }
};

export default authCheck;