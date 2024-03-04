"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { images } from "@/app/constants/slider";
import Description from "./Description";

const Slider = () => {
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
    <div className="grid lg:grid-cols-2 grid-cols-1 bg-white mx-auto my-auto shadow-xl ">
      <div className="w-full flex flex-col justify-center items-center gap-4 transition-transform ease-in-out duration-500  p-6 md:p-0">
        {images.map((elem, idx) => (
          <div key={idx} className={`${idx === activeImage ? "flex justify-center items-center container transition-all duration-500 ease-in-out" : "hidden"}`}>
            <Image src={elem.src} alt=""  />
          </div>
        ))}
      </div>
      <Description activeImage={activeImage} clickNext={clickNext} clickPrev={clickPrev} />
    </div>
  );
};

export default Slider;
