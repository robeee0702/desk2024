"use client";
import Link from "next/link";
import { UserButton, useClerk } from "@clerk/nextjs";
import Logo from "@/public/tech_logo.svg";
import Image from "next/image";
import { onValue, ref, set } from "firebase/database";
import { database } from "@/firebase";
import LeftSidebar from "./LeftSidebar";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user } = useClerk();

  const [isPaid, setIsPaid] = useState();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2100);

    return () => clearTimeout(loadingTimeout);
  }, []);

  useEffect(() => {
    const fetchData = () => {
      if (user) {
        const socket = io("http://localhost:3012");

        socket.on("completedSessions", (data) => {

          if (
            data.completedSessions.some(
              (session) =>
                session.sessionEmail === user.primaryEmailAddress.emailAddress
            )
          ) {
            const paymentRef = ref(database, `users/data/${user?.id}/payment/`);

            set(paymentRef, { paid: true })
              .then(() => {

                onValue(paymentRef, (snapshot) => {
                  const paymentData = snapshot.val();
                  const updatedIsPaid = paymentData?.paid;

                  setIsPaid(updatedIsPaid);

                  socket.disconnect();
                  // router.push("/main");
                });
              })
              .catch((error) => {
                console.error("Failure in payment:", error);
              });
          } else {
            console.log(
              "Not included the emails from Clerk"
            );
            alert("Failure by payment");
          }
        });

        socket.on("disconnect", () => {
          console.log("Disconnected");
        });

        return () => {
          if (socket.connected) {
            socket.disconnect();
          }
        };
      }
    };

    fetchData();
  }, [user, router]);


  return (
    <nav className="flex items-center justify-between px-3 bg-gradient-to-l from-black84 to-black96  z-20">
      <div className="flex items-center">
        <Link href="/">
          <div className="text-lg font-bold text-black uppercase">
            <Image
              className="custom-logo w-36 md:w-44 text-black"
              height={56}
              src={Logo}
              alt="TechVentory"
            />
          </div>
        </Link>
      </div>
      {isLoading && (
        <div></div>
      )}
      {!isLoading && (
        <>
          <div className="hidden md:flex">
            {user && user?.id && isPaid && <LeftSidebar />}
          </div>
          {/* <Link href="https://buy.stripe.com/eVacNM8dK8X162cbIJ"></Link>    */}
          {/* <Link href="https://buy.stripe.com/test_bIY4hvbiY4QYa0ocMM">BUY </Link>    */}

          <div className="flex items-center text-black">
            {!user && !user?.id ? (
              <>
                <Link
                  href="sign-in"
                  className="p-2 m-2 rounded-lg shadow-sm text-white bg-black72 hover:scale-105 hover:opacity-80"
                >
                  Sign In
                </Link>
                <Link
                  href="sign-up"
                  className="p-2 m-2 rounded-lg shadow-sm text-white bg-black72 hover:scale-105 hover:opacity-80"
                >
                  Sign Up
                </Link>
              </>
            ) : !isPaid ? (
              <>
                <div className="p-1 px-2.5 mx-4 rounded-lg shadow-sm text-white bg-black72 hover:scale-105 hover:opacity-80">
                  <Link href="https://buy.stripe.com/test_bIY4hvbiY4QYa0ocMM">
                    PAY
                  </Link>
                </div>
              </>
            ) : null}
            <div className="ml-auto">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
