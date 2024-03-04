import React from "react";
import { images } from "@/app/constants/slider";
import left from "@/public/left.svg";
import right from "@/public/right.svg";
import { motion } from "framer-motion";
import Image from "next/image";
import Logo from "@/public/tech_logo.svg";


type Props = {
  activeImage: any;
  clickNext: any;
  clickPrev: any;
};

const Description = ({ activeImage, clickNext, clickPrev }: Props) => {
  return (
    <div className="grid place-items-start w-full p-6 md:p-14 bg-black84 ">
        <Image src={Logo} alt="logo" height={160} />

      {images.map((elem, idx) => (
        <div key={idx} className={`${idx === activeImage ? "block w-full text-left" : "hidden"}`}>
          <motion.div
            initial={{
              opacity: idx === activeImage ? 0 : 0.5,
              scale: idx === activeImage ? 0.5 : 0.3,
            }}
            animate={{
              opacity: idx === activeImage ? 1 : 0.5,
              scale: idx === activeImage ? 1 : 0.3,
            }}
            transition={{
              ease: "linear",
              duration: 2,
              x: { duration: 1 },
            }}
            className="w-full">
            <div className="text-5xl font-extrabold mt-2">{elem.title}</div>
            <div className="leading-relaxed font-medium text-base tracking-wide mt-6 italic text-gray-600"> {elem.desc}</div>
          </motion.div>
          <div className="flex justify-between w-full">
            <div className="md:mt-16 cursor-pointer">
              <Image src={left} alt="" onClick={clickPrev} width={48}/>
            </div>
            <div className="md:mt-16 cursor-pointer">
              <Image src={right} alt="" onClick={clickNext} width={48}/>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Description;
