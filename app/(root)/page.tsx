"use client";
import "../globals.css";
import { useEffect, useState } from "react";
import { getLanguage } from "../constants";
import { database } from "@/firebase";
import { useClerk } from "@clerk/nextjs";
import { onValue, ref, set } from "firebase/database";
import { useRouter } from "next/navigation";
import Logo from "@/public/tech_logo.svg";
import Image from "next/image";
import { images } from "@/app/constants/slider";
import Slider from "../components/Slider";
import Header from "../components/Header";
import { LuMailPlus } from "react-icons/lu";
import LeftSidebar from "../components/LeftSidebar";

const translations = {
  en: {
    afterPayment: " After payment click on Login",
    login: "Login",
    paySuccessfully: "Successfully pay",
    enterDone: "Enter enabled",
    welcome: "Welcome to TechVentory",
  },
  de: {
    afterPayment: "Nach der Zahlung klicken Eintritt",
    login: "Eintritt",
    paySuccessfully: "Zahlung bestätigt",
    enterDone: "Anmelden möglich",
    welcome: "Willkommen am TechVentory",
  },
  hu: {
    afterPayment: "Sikeres fizetés után kattints a belépésre",
    login: "Belépés",
    paySuccessfully: "Sikeres fizetés",
    enterDone: "Belépés engedélyezve",
    welcome: "Üdvözöl a TechVentory",
  },
};

export default function Home() {
  const [language, setLanguage] = useState<string>("en"); //Alapértelmezett angol
  const translation = translations[language];

  useEffect(() => {
    const clientLanguage = getLanguage();
    setLanguage(clientLanguage);
  }, []);

  const { user } = useClerk();

  const router = useRouter();

  useEffect(() => {
    if (user && user.id) {
      const paymentRef = ref(database, `users/data/${user.id}/payment/`);

      const unsubscribe = onValue(paymentRef, (snapshot) => {
        const paymentData = snapshot.val();
        const isPaid = paymentData?.paid;

        if (isPaid) {
          alert(translation.enterDone);
        } else {
          console.log("Please pay!");
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const [activeImage, setActiveImage] = useState(0);

  const clickNext = () => {
    activeImage === images.length - 1 ? setActiveImage(0) : setActiveImage(activeImage + 1);
  };
  const clickPrev = () => {
    activeImage === 0 ? setActiveImage(images.length - 1) : setActiveImage(activeImage - 1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      clickNext();
    }, 5000);
    return () => {
      clearTimeout(timer);
    };
  }, [activeImage]);

  return (
    <div className="flex flex-col justify-between min-h-screen w-full bg-gradient-to-l from-black84 to-black96">
      <div className="w-full bg-gradient-to-l from-black84 to-black96">
        <Header />
        <div className="flex md:hidden">
          <LeftSidebar />
        </div>
        {/* 2.rész: Tartalom rész */}
        <div className="flex flex-1 mx-auto mb-8 p-2 md:p-8 lg:p-12 xl:p-14 md:mt-8 xl:mt-12 w-11/12 lg:h-5/6">
          <Slider />
        </div>
      </div>
      {/* 3.rész: Lábléc rész */}
      <footer className="flex w-full justify-around bg-gradient-to-l from-black84 to-black96 mt-auto overflow-hidden" 
      // style={{ boxShadow: "0 -12px 15px -5px rgba(0, 0, 0, 0.2), 0 -6px 12px -8px rgba(0, 0, 0, 0.15)" }}
      >
        <div className="flex  mt-auto">
          <a href="/">
            <Image src={Logo} className="w-48 md:w-80  object-contain" alt="logo" />
          </a>
        </div>

        {/* <!-- Üres grid cellák --> */}
        <div className="flex items-end text-black">
         
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-4 md:mb-0 "></div>

          <div className="mx-4 mb-4 md:mb-0 ">
            <LuMailPlus size={42} />
            <a href="mailto:info@tech-ventory.com" className="text-lg">
              info@tech-ventory.com
            </a>
          </div>
        </div>

        {/* <!-- Üres grid cellák --> */}
        <div className="m-1 mt-auto">
          <ul className="list-none font-bold">
            <li>
              {/* <a href="/about" className="text-gray-800 hover:text-gray-800">
                    About us
                  </a> */}
            </li>
            <li>
              <a href="/privacy" className="text-center">
                Privacy Policy
              </a>
            </li>
            <div className="py-2 flex ">
            <div className="text-black font-bold"> Copyright &copy; 2024 TechVentory</div>
          </div>
          </ul>
        </div>
      </footer>
    </div>
  );
}
