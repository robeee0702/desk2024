"use client";
import { usePathname, useRouter } from "next/navigation";
import { BsChevronDown } from "react-icons/bs";
import { sidebarLinks } from "@/app/constants";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

const LeftSidebar = () => {
  const [open, setOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(Array(sidebarLinks.length).fill(false));
  const [openSubMenuIndex, setOpenSubMenuIndex] = useState(null);
  const pathname = usePathname();
  const containerRef = useRef(null);
  const router = useRouter();


  useEffect(() => {
    const container = containerRef.current;
  
    const handleMouseLeave = (e) => {
      const relatedTarget = e.relatedTarget;
      if (!container || !relatedTarget) {
        return;
      }
  
      const isInsideMenu = container.contains(relatedTarget);
      if (!isInsideMenu) {
        setOpen(false);
        setOpenSubMenuIndex(-1);
        setSubmenuOpen(new Array(submenuOpen.length).fill(false));
      }
    };
  
    container.addEventListener("mouseleave", handleMouseLeave);
  
    return () => {
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [containerRef.current]);




  // 
  const handleClick = (e, mainIndex, index, route) => {
    e.preventDefault();

    // Ha van almenü, azonnal jelenjenek meg az almenük
    if (sidebarLinks[mainIndex].submenu) {
      const newSubMenuOpen = [...submenuOpen];
      newSubMenuOpen[mainIndex] = !newSubMenuOpen[mainIndex];
      setSubmenuOpen(newSubMenuOpen);

      if (!newSubMenuOpen[mainIndex] && submenuOpen.some((open) => open)) {
        setOpenSubMenuIndex(-1);
      }

      return;
    }


    setOpenSubMenuIndex(index);

    const newSubMenuOpen = [...submenuOpen];
    newSubMenuOpen[mainIndex] = !newSubMenuOpen[mainIndex];
    setSubmenuOpen(newSubMenuOpen);

    router.push(route);
  };

  

  return (
    <div className="flex-row  md:flex-col bg-transparent z-40 m-1 md:m-0 rounded-lg">
      <section
        className={`hidden bg-transparent md:flex px-3 rounded-sm `}
        ref={containerRef}
       >
        <div className="flex relative flex-row items-center">
          {sidebarLinks.map((link, mainIndex) => {
            const isActive = useMemo(() => (pathname.includes(link.route) && link.route.length > 1) || pathname === link.route, [pathname, link.route]);

            return (
              <div className=" px-1 mx-1 text-black hover:scale-105 hover:text-black72 cursor-pointer" key={link.label}>
                <a href={link.route} className={` ${isActive && "bg-blue "}`} onClick={(e) => handleClick(e, mainIndex, -1, link.route)}>
                  <div className="flex items-center mx-2">
                    {typeof link.imgURL !== "string" && <link.imgURL size={24} />}
                    <p className={`text-sm ml-2 font-bold`}>{link.label}</p>
                    {link.submenu && <BsChevronDown size={20} className={`${submenuOpen[mainIndex] ? "rotate-180" : ""} m-1`} onClick={(e) => handleClick(e, mainIndex, mainIndex, link.route)} />}
                  </div>
                </a>
                {link.submenu && submenuOpen[mainIndex] && (
                 <ul className="flex absolute flex-col overflow-y-auto z-30 font-bold">
                 {link.submenuItems.map((submenuItem, index) => (
                   <a key={submenuItem.label} href={submenuItem.route}>
                     <li
                       className={`text-black bg-black84 text-sm flex border border-black items-center gap-x-4 cursor-pointer m-2 p-1 px-4 z-20 hover:scale-105 rounded-md ${
                         openSubMenuIndex === index ? "submenu-open" : ""
                       }`}
                     >
                       <div>{submenuItem.label}</div>
                     </li>
                   </a>
                 ))}
               </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section
        className={`flex md:hidden bg-transparent rounded-sm p-1 ${!open ? "w-16 " : "w-60 top-14 bottom-0 left-0 right-0 z-10"}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => {
          setOpen(false);
        }}>
        <div className={`flex ${open ? "flex-col" : "flex-row"} `}>
          {sidebarLinks.map((link, mainIndex) => {
            const isActive = useMemo(() => (pathname.includes(link.route) && link.route.length > 1) || pathname === link.route, [pathname, link.route]);

            return (
              <div className="flex-row my-auto mx-1 p-2 text-black hover:text-darkgrey cursor-pointer" key={link.label}>
                <a href={link.route} className={` ${isActive && "bg-blue "}`} onClick={(e) => handleClick(e, mainIndex, -1, link.route)}>
                  <div className="flex my-auto">
                    {typeof link.imgURL !== "string" && <div className={`flex items-center ${!open}`}>{React.createElement(link.imgURL, { size: 24 })}</div>}

                    <p className={`text-sm ml-2 ${!open && "hidden"}`}>{link.label}</p>
                    {link.submenu && open && <BsChevronDown size={20} className={`${submenuOpen[mainIndex] ? "rotate-180" : ""} m-2`} onClick={(e) => handleClick(e, mainIndex, mainIndex, link.route)} />}
                  </div>
                </a>
                {link.submenu && submenuOpen[mainIndex] && (
                 <ul className="flex absolute flex-col overflow-y-auto z-30">
                 {link.submenuItems.map((submenuItem, index) => (
                   <a key={submenuItem.label} href={submenuItem.route}>
                     <li
                       className={`text-white bg-black84 text-sm flex border border-darkgrey items-center gap-x-4 cursor-pointer m-2 p-1 px-4 z-20 hover:scale-105 rounded-md ${
                         openSubMenuIndex === index ? "submenu-open" : ""
                       }`}
                     >
                       <div>{submenuItem.label}</div>
                     </li>
                   </a>
                 ))}
               </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default LeftSidebar;

